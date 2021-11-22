const fs = require('fs')
const path = require('path')
const glob = require('glob')
const retry = require('async-retry')

class EliteJson {
  constructor(dir) {
    this.dir = dir || null
    this.files = {}
    this.loadFileCallback = null
    return this
  }

  load({ file = null } = {}) {
    return new Promise(async (resolve) => {
      // If file specified, load that file, otherwise load all files
      const files = file ? [file] : await this.#getFiles()
      for (const file of files) {
        await retry(async bail => {
          // Load file contents as JSON
          file.contents = JSON.parse(fs.readFileSync(file.name).toString())
          // Track file if not already being tracked
          if (!this.files[file.name]) this.files[file.name] = file

          if (this.loadFileCallback) this.loadFileCallback(file)
        }, {
          retries: 10
        })
      }
      resolve(file ? files[0] : files)
    })
  }

  watch(callback) {
    const watchFiles = async () => {
      const files = await this.#getFiles()

      // Make sure we know about all files
      for (const file of files) {
        if (!this.files[file.name]) this.files[file.name] = file
      }

      // Make sure we are watching all files we know about
      for (const name in this.files) {
        if (!this.files[name].watch) {
          this.files[name].watch = this.#watchFile(this.files[name], callback)
        }
      }
    }

    // Start watching for changes
    watchFiles()

    // Periodically check we know about and are watching new files
    this.watchFilesInterval = setInterval(() => { watchFiles() }, 60 * 1000)
  }

  async json(forceUpdate = false) {
    const files = forceUpdate ? await this.load(): this.files
    const response = {}
    for (const name in files) {
      response[files[name].label] = files[name].contents
    }
    return response
  }

  async #watchFile(file, callback) {
    let debounce
    return fs.watch(file.name, async (event, filename) => {
      try {
        if (!filename) return
        if (debounce) return
        debounce = setTimeout(() => { debounce = false }, 100)
        this.files[file.name] = await this.load({file})
        // Send data for all files in the callback
        if (callback) callback(await this.json())
      } catch (e) {
        console.error("watcher error", file)
      }
    })
  }

  #getFiles() {
    return new Promise(resolve => {
      glob(`${this.dir}/*.json`, {}, async (error, files) => {
        if (error) return console.error(error)

        const response = files.map(name => {
          const lastModified = fs.statSync(name).mtime
          return new File({ 
            name,
            lastModified,
            label: path.basename(name).replace(/\.json$/, '')
          })
        })

        resolve(response)
      })
    })
  }
}

class File {
  constructor({name, lastModified, label, contents, watch = false}) {
    this.name = name // Full path to file
    this.lastModified = lastModified
    this.label = label
    this.contents = contents
    this.watch = watch
  }
}

module.exports = EliteJson