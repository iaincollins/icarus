const fs = require('fs')

const DATA_DIR = 'data'

class Storage {
  constructor () {
    if (!fs.existsSync(DATA_DIR)) {
      console.log('Creating data directory', DATA_DIR, '\n')
      fs.mkdirSync(DATA_DIR)
    }

    return this
  }

  async getStorage (name) {
    const filePath = DATA_DIR + '/' + name + '.json'
    if (!fs.existsSync(filePath)) {
      return null
    }

    const rawdata = fs.readFileSync(filePath)
    const data = JSON.parse(rawdata)

    return data
  }

  async saveStorage (name, data) {
    console.log(data)
    const filePath = DATA_DIR + '/' + name + '.json'
    await fs.writeFile(filePath, JSON.stringify(data), (err) => {
      if (err)
        console.error(err)
      
      console.log(`The file [${filePath}] has been saved!`);
    })
  }
}

module.exports = Storage
