module.exports = class Data {
  constructor (file) {
    this.data = require(`../data/${file}.json`)
  }

  getBySymbol (itemSymbol) {
    let result
    Object.values(this.data).some(item => {
      if (item?.symbol?.toLowerCase() === itemSymbol?.toLowerCase()) {
        result = item
        return true
      }
      return false
    })

    if (!result) console.error('Outfitting: Failed to lookup item', itemSymbol)

    return result
  }
}
