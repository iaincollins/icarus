module.exports = class Data {
  constructor (asset) {
    this.asset = asset
    this.data = require(`../data/${asset}.json`)
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

    // if (!result) console.error('Lookup failed', this.asset, itemSymbol)

    return result
  }
}
