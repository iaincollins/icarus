const outfitting = require('./outfitting.json')

class Outfitting {
  static async getModule (itemSymbol) {
    let item
    Object.values(outfitting).some(oufittingItem => {
      if (oufittingItem.symbol.toLowerCase() === itemSymbol.toLowerCase()) {
        item = oufittingItem
        return true
      }
      return false
    })

    if (!item) console.error('Outfitting: Failed to lookup item', itemSymbol)

    return item
  }
}

module.exports = Outfitting
