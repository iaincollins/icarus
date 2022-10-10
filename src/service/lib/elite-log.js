const fs = require('fs')
const path = require('path')
const crypto = require('crypto')
const glob = require('glob')
const retry = require('async-retry')
const Datastore = require('nedb-promises')
const db = new Datastore()

// Do not fire log events for these event types
const INGORED_EVENT_TYPES = [
  'Music'
]

// Override PERSISTED_EVENT_TYPES to persist all events to DB (for testing)
const PERSIST_ALL_EVENTS = true

// These events will be persisted to the database
// (for all other events, only the most recent copy will be retained in memory)
const PERSISTED_EVENT_TYPES = [
  'FSSBodySignals',
  'FSSDiscoveryScan',
  'FSSSignalDiscovered'
]

class EliteLog {
  constructor(dir) {
    this.dir = dir || null
    this.files = {} // All log files found
    this.lastActiveLogFileName = null
    this.lastActiveTimestamp = null
    this.loadFileCallback = null
    this.logEventCallback = null
    this.singleInstanceEvents = {}
    this.numberOfEventsImported = 0

    // setInterval(() => {
    //   const numberOfFilesBeingWatched = Object.entries(this.files)
    //     .filter(obj => {
    //       const [fileName, file] = obj
    //       return file.watch !== false
    //     }).length

    //   console.log(`events: ${this.numberOfEventsImported}\tmost recent event: ${this.lastActiveTimestamp}\tfiles watched: ${numberOfFilesBeingWatched}`)
    // }, 2000)

    return this
  }

  async clear() {
    await db.remove({}, { multi: true })
  }

  // Get all log entries
  load({ 
    file = null, // Load a particular file (used internally when file changes)
    days = null, // Days since last activity to load (if null, load all events)
    reload = false // Attempt to reload all events if they are older (safe, won't result in duplicates)
  } = {}) {
    return new Promise(async (resolve) => {
      let logs = []
      // If file specified, load logs from that file, otherwise load all files
      const files = file ? [file] : await this.#getFiles()

      // Only determine a minimum timestamp if number of days specified and on
      // first run (this.lastActiveTimestamp will not be null if any events
      // have actually been imported already).
      let minTimestamp = null
      if (days !== null && !this.lastActiveTimestamp) {
        let oldestTimestamp = null
        let newestTimestamp = null
        for (const file of files) {
          await retry(() => { // Auto-retry on failure (write in progress)
            const rawLog = fs.readFileSync(file.name).toString()
            const logs = this.#parse(rawLog)
            for (const log of logs) {
              if (!newestTimestamp || (Date.parse(log.timestamp) > Date.parse(newestTimestamp)))
                newestTimestamp = log.timestamp

              if (!oldestTimestamp || (Date.parse(log.timestamp) < Date.parse(oldestTimestamp)))
                oldestTimestamp = log.timestamp
            }
          }, {
            retries: 10
          })
        }
        
        // Store in human readable timestamp for easier debugging
        // (performance impact is minimal)
        if (newestTimestamp) { // Conditonal to suppress errors when no data loaded
          minTimestamp = new Date(Date.parse(newestTimestamp) - days * 24 * 60 * 60 * 1000).toISOString()
        }
      }

      for (const file of files) {
        // Skip old files that haven't been modified since minTimestamp
        if (minTimestamp && Date.parse(minTimestamp) > Date.parse(file.lastModified)) continue

        // If any step fails (e.g if trying read and parse while being written)
        // then is automatically retried with this function.
        //
        // There is no error handling here, but the function has exponential
        // backoff and while single failures are quite common more than one
        // retry is extremely rare.
        await retry(() => {
          const rawLog = fs.readFileSync(file.name).toString()
          const parsedLog = this.#parse(rawLog)
          logs = logs.concat(parsedLog) // Add new log entries to existing logs
          if (this.loadFileCallback) this.loadFileCallback(file)
        }, {
          retries: 10
        })
      }

      // If a minimum timestamp was specified, use it to filter what is loaded
      if (minTimestamp) {
        logs = logs.filter(log => (Date.parse(log.timestamp) > Date.parse(minTimestamp)))
      }

      // If lastActiveTimestamp has been set, this function has been run at
      // least once already. We can use it to discard old log files without
      // spending more time on them. Overriden by reload argument.
      if (this.lastActiveTimestamp && reload !== true) {
        logs = logs.filter(log => (Date.parse(log.timestamp) > Date.parse(this.lastActiveTimestamp)))
      }

      // Enforces unique database entry constraint using checksum.
      // This makes initial load times slower, but makes it easier to make the
      // app more performant once the initial import is complete. To optimise
      // for performance and memory usage we only persist events to the database
      // where it makes sense to do so, otherwise we just keep the most recent 
      // copy of each event type in memory.
      await db.ensureIndex({ fieldName: '_checksum', unique: true })
      
      const logsIngested = []
      for (const log of logs) {
        this.numberOfEventsImported++

        let logIngested = false
        const eventName = log.event
        const eventTimestamp = log.timestamp

        // Generate unique checksum for each message to avoid duplicates.
        // This is also useful for clients who receive new event log entries
        // so they can ignore events they ahve seen before (e.g. after a reload)
        log._checksum = this.#checksum(JSON.stringify(log))

        // Keep track of the most recent timestamp seen across all logs
        // (so when we are called again can skip over logs we've already seen)
        if (!this.lastActiveTimestamp)
          this.lastActiveTimestamp = eventTimestamp
        
        if (Date.parse(eventTimestamp) > Date.parse(this.lastActiveTimestamp))
          this.lastActiveTimestamp = eventTimestamp

        // Skip ignored event types (e.g. Music)
        if (INGORED_EVENT_TYPES.includes(eventName)) continue

        // Only persist supported event types in the databases
        if (PERSIST_ALL_EVENTS === true || PERSISTED_EVENT_TYPES.includes(eventName)) {
          // Insert each message one by one, as using bulk import with constraint
          // (which is faster) tends to fail because logs contain duplicates.
          const isUnique = await this.#insertUnique(log)

          if (isUnique === true) logIngested = true
        } else {
          // If it's not a persisted event type, only keep a copy of it if it
          // has a more recent timestamp than the event we currently have.
          // This is useful if we only ever need the latest version of and event
          // and is faster and uses less RAM than keeping everything in memory.
          if (this.singleInstanceEvents[eventName]) {
            if (Date.parse(eventTimestamp) > Date.parse(this.singleInstanceEvents[eventName].timestamp)) {
              this.singleInstanceEvents[eventName] = log
              logIngested = true
            }
          } else {
            this.singleInstanceEvents[eventName] = log
            logIngested = true
          }
        }

        // If log was ingested, set to true and trigger callback
        if (logIngested) {
          logsIngested.push(log)
          if (this.logEventCallback) this.logEventCallback(log)
        }
      }
      resolve(logsIngested)
    })
  }

  stats() {
    return {
      numberOfEventsImported: this.numberOfEventsImported,
      mostRecentEventTimestamp: this.lastActiveTimestamp,
      lastActivity: this.lastActiveTimestamp,
      files: this.files
    }
  }

  async count() {
    return await db.count({})
  }

  async getNewest(count) {
    if (count) {
      return await db.find({}).sort({ timestamp: -1 }).limit(count)
    } else {
      return await db.findOne({}).sort({ timestamp: -1 })
    }
  }

  async getOldest(count) {
    if (count) {
      return await db.find({}).sort({ timestamp: 1 }).limit(count)
    } else {
      return await db.findOne({}).sort({ timestamp: 1 })
    }
  }

  async getFromTimestamp(timestamp = new Date().toUTCString, count = 100) {
    return await db.find({ "timestamp": { $gt: timestamp } }).sort({ timestamp: -1 }).limit(count)
  }

  async getEvent(event) {
    return (await this.getEvents(event, 1))[0]
  }

  async getEvents(event, count = 0) {
    // For single instance events, return single copy we are holding in memory
    if (this.singleInstanceEvents[event]) return [this.singleInstanceEvents[event]]
    if (count > 0) {
      return await db.find({ event }).sort({ timestamp: -1 }).limit(count)
    } else {
      return await db.find({ event }).sort({ timestamp: -1 })
    }
  }

  async getEventsFromTimestamp(event, timestamp = new Date().toUTCString, count = 0) {
    // For single instance events, return single copy we are holding in memory
    if (this.singleInstanceEvents[event]) return [this.singleInstanceEvents[event]]
    if (count > 0) {
      return await db.find({ event, "timestamp": { $gt: timestamp } }).sort({ timestamp: -1 }).limit(count)
    } else {
      return await db.find({ event, "timestamp": { $gt: timestamp } }).sort({ timestamp: -1 })
    }
  }

  // Escape hatch for complex queries
  async _query(queryString, count = 0, sort = { timestamp: -1 }) {
    if (count > 0) {
      return await db.find(queryString).sort(sort).limit(count)
    } else {
      return await db.find(queryString).sort(sort)
    }
  }


  async getEventTypes() {
    const logs = await db.find()
    const eventTypes = []
    for (const log of logs) {
      if (!eventTypes.includes(log.event)) eventTypes.push(log.event)
    }
    return eventTypes
  }

  watch(callback) {
    const watchFiles = async () => {
      const files = await this.#getFiles()

      // If no files found, nothing to do
      if (files.length === 0) return 

      // Get currently active log file (mostly recently modified) in case that
      // has changed since we loaded (e.g. due to log rotation)
      const activeLogFile = files.sort((a, b) => b.lastModified - a.lastModified)[0]
      this.lastActiveLogFileName = activeLogFile.name

      // Get all log files
      for (const file of files) {
        if (!this.files[file.name])
          this.files[file.name] = file

        // Add watcher to log file, if it's the currently active log file
        if (!this.files[file.name].watch && file.name === activeLogFile.name)
          this.files[file.name].watch = this.#watchFile(file, callback)
      }

      // Remove any previously bound listeners from other files
      for (const file in this.files) {
        if (file.watch && file.name !== activeLogFile.name) {
          // Check for any logs we might have missed during log rotation
          const logs = await this.load({file})
          if (callback) logs.map(log => callback(log))
          // Remove watch from file
          fs.unwatchFile(file.name, file.watch)
          file.watch = false
        }
      }
    }

    // Start watching for changes
    watchFiles()

    // Periodically check for new log files
    this.watchFilesInterval = setInterval(() => { watchFiles() }, 10 * 1000)
  }

  async #watchFile(file, callback) {
    // fs.watch is proving to not be reliable and is not picking up changes
    // to game logs on Windows at all so falling back to the older
    // fs.watchFile, which uses polling rather than file system events.
    let debounce
    return fs.watchFile(
      file.name,
      { interval: 1000 },
      async (event, filename) => {
        if (!filename) return
        if (debounce) return
        debounce = setTimeout(() => { debounce = false }, 100)
        const logs = await this.load({file})
        try {
          // Trigger callback for each log entry loaded
          if (callback) logs.map(log => callback(log))
        } catch (e) {
          console.error(e)
        }
    })
  }
  
  async #insertUnique(log) {
    return await new Promise(async (resolve, reject) => {
      db.insert(log)
      .then(() => { return resolve(true) }) // Return true if not duplicate
      .catch(e => {
        if (e.errorType === 'uniqueViolated') {
          return resolve(false) // Return false (but don't error) if duplicate
        } else {
          // Error for other failure conditions
          return reject(e)
        }
      })
    })
  }

  // Get path to all log files in dir
  #getFiles() {
    return new Promise(resolve => {
      // Note: Journal.*.log excludes files like JournalAlpha.*.log so that
      // alpha / beta test data doesn't get included by mistake.
      glob(`${this.dir}/Journal.*.log`, {}, async (error, globFiles) => {
        if (error) return console.error(error)

        const files = globFiles.map(name => {
          const { size, mtime: lastModified } = fs.statSync(name)
          const lineCount = fs.readFileSync(name).toString().split('\n').length
          return new File({ name, lastModified, size, lineCount })
        })

        // Track most (mostly recently modified) log file
        if (files.length > 0) {
          const activeLogFile = files.sort((a, b) => b.lastModified - a.lastModified)[0]
          this.lastActiveLogFileName = activeLogFile.name
        }

        resolve(files)
      })
    })
  }

  // Load log file and parse into an array of objects
  #parse(rawLog) {
    const sortedLog = rawLog.split("\n").reverse()
    let parsedLog = []
    sortedLog.map(logLine => {
      try {
        parsedLog.push(JSON.parse(logLine))
      } catch (e) {
        return false // Skip entries that don't parse (e.g. blank lines)
      }
    })
    return parsedLog
  }

  #checksum(string) {
    return crypto.createHash('sha256').update(string).digest('hex')
  }
}

class File {
  constructor({name, lastModified, size, lineCount, watch = false}) {
    this.name = name // Full path to file
    this.lastModified = lastModified
    this.size = size,
    this.lineCount = lineCount
    this.watch = watch
  }
}

module.exports = EliteLog