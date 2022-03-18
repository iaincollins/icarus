
class Inventory {
  constructor ({ eliteLog, eliteJson }) {
    this.eliteLog = eliteLog
    this.eliteJson = eliteJson
    return this
  }

  async getInventory () {
    const shipLocker = (await this.eliteJson.json()).ShipLocker
    if (!shipLocker) return []

    const inventory = []

    shipLocker.Consumables.forEach(item => {
      let itemInInventory = inventory.filter(i => i.name === (item?.Name_Localised ?? item.Name))[0]
      if (!itemInInventory) {
        itemInInventory = {
          name: item?.Name_Localised ?? item.Name,
          type: 'Consumable',
          mission: 0,
          stolen: 0,
          count: 0
        }
        inventory.push(itemInInventory)
      }

      itemInInventory.count += item.Count
      if (item.MissionID) itemInInventory.mission += item.Count
      if (item.OwnerID > 0) itemInInventory.stolen += item.Count
    })

    shipLocker.Items.forEach(item => {
      let itemInInventory = inventory.filter(i => i.name === (item?.Name_Localised ?? item.Name))[0]
      if (!itemInInventory) {
        itemInInventory = {
          name: item?.Name_Localised ?? item.Name,
          type: 'Goods',
          mission: 0,
          stolen: 0,
          count: 0
        }
        inventory.push(itemInInventory)
      }

      itemInInventory.count += item.Count
      if (item.MissionID) itemInInventory.mission += item.Count
      if (item.OwnerID > 0) itemInInventory.stolen += item.Count
    })

    shipLocker.Components.forEach(item => {
      let itemInInventory = inventory.filter(i => i.name === (item?.Name_Localised ?? item.Name))[0]
      if (!itemInInventory) {
        itemInInventory = {
          name: item?.Name_Localised ?? item.Name,
          type: 'Component',
          mission: 0,
          stolen: 0,
          count: 0
        }
        inventory.push(itemInInventory)
      }

      itemInInventory.count += item.Count
      if (item.MissionID) itemInInventory.mission += item.Count
      if (item.OwnerID > 0) itemInInventory.stolen += item.Count
    })

    shipLocker.Data.forEach(item => {
      let itemInInventory = inventory.filter(i => i.name === (item?.Name_Localised ?? item.Name))[0]
      if (!itemInInventory) {
        itemInInventory = {
          name: item?.Name_Localised ?? item.Name,
          type: 'Data',
          mission: 0,
          stolen: 0,
          count: 0
        }
        inventory.push(itemInInventory)
      }

      itemInInventory.count += item.Count
      if (item.MissionID) itemInInventory.mission += item.Count
      if (item.OwnerID > 0) itemInInventory.stolen += item.Count
    })

    inventory.sort((a, b) => a.name.localeCompare(b.name))

    return inventory
  }
}

module.exports = Inventory
