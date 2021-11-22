const fs = require('fs')
const path = require('path')
const crypto = require('crypto')
const glob = require('glob')
const retry = require('async-retry')
const Datastore = require('nedb-promises')
const db = new Datastore()

class EliteLog {
  constructor(dir) {
    this.dir = dir || null
    this.files = {} // All log files found
    this.activeLog = null // Most recently written logfile
    this.loadFileCallback = null
    this.loadLogEntryCallback = null
    return this
  }

  async clear() {
    await db.remove({}, { multi: true })
  }

  // Get all log entries
  load({ timestamp = null, file = null } = {}) {
    return new Promise(async (resolve) => {
      let logs = []
      // If file specified, load logs from that file, otherwise load all files
      const files = file ? [file] : await this.#getFiles()
      for (const file of files) {
        // If any step fails (e.g if trying read and parse while being written)
        // then is automatically retried with this function.
        //
        // There is no error handling here, but the function has exponential
        // backoff and while single failures are quite common more than one
        // retry is extremely rare.

        await retry(async bail => {
          const rawLog = fs.readFileSync(file.name).toString()
          const parsedLog = this.#parse(rawLog)

          // Add new log data to existing log data 
          logs = logs.concat(parsedLog)

          if (this.loadFileCallback) this.loadFileCallback(file)
        }, {
          retries: 10
        })
      }

      // If timestamp given, only try to load records newer than the timestamp
      if (timestamp) {
        logs = logs.filter(log => (log.timestamp > timestamp))
      }

      // Option 1: Bulk insert is fast but results in duplicates in the database
      // await db.insert(log)

      // Option 2 : Enforces unique database entry constraint using checksum
      // This makes initial load times slower, but makes it easier to make the
      // app more performant once the initial import is complete.
      //
      // Ensure unique _checksum constraint for every entry
      await db.ensureIndex({ fieldName: '_checksum', unique: true })
      
      const uniqueLogs = []
      for (const log of logs) {
        // Generate unique checksum for each message to avoid duplicates
        // Timestamp would probably be sufficent, but checksum is more robust
        // and performance difference and overhead are inconsequential.
        log._checksum = this.#checksum(JSON.stringify(log))

        // Insert each message one by one, as using bulk import with constraint
        // (which is faster) tends to fail because logs contain duplicates.
        const isUnique = await this.#insertUnique(log)

        if (isUnique === true) {
          uniqueLogs.push(log)
          if (this.loadLogEntryCallback) this.loadLogEntryCallback(log)
        }
      }

      resolve(uniqueLogs)
    })
  }

  async update() {
    const timestmap = this.getNewest().timestamp
    return await this.load({timestamp})
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

  async getFromTimestamp(timestamp = new Date().toUTCString) {
    return await db.find({ "timestamp": { $gt: timestamp } }).sort({ timestamp: -1 })
  }

  async getEvent(event) {
    return (await this.getEvents(event))[0]
  }

  async getEvents(event, count = 10) {
    return await db.find({ event }).sort({ timestamp: -1 }).limit(count)
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

      // Get currently active log file (mostly recently modified)
      const activeLogFile = files.sort((a, b) => b.lastModified - a.lastModified)[0]

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
      glob(`${this.dir}/Journal.*.log`, {}, async (error, files) => {
        if (error) return console.error(error)

        const response = files.map(name => {
          const lastModified = fs.statSync(name).mtime
          return new File({ name, lastModified })
        })

        resolve(response)
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
  constructor({name, lastModified, watch = false}) {
    this.name = name // Full path to file
    this.lastModified = lastModified
    this.watch = watch
  }
}

module.exports = EliteLog