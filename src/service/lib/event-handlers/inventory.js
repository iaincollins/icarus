
class Inventory {
  constructor ({ eliteLog, eliteJson }) {
    this.eliteLog = eliteLog
    this.eliteJson = eliteJson
    return this
  }

  async getInventory () {
    const shipLocker = (await this.eliteJson.json()).ShipLocker
    if (!shipLocker) return []

    const inventoryItems = []

    shipLocker.Consumables.forEach(item => {
      let itemInInventory = inventoryItems.filter(i => i.name === (item?.Name_Localised ?? item.Name))[0]
      if (!itemInInventory) {
        itemInInventory = {
          name: item?.Name_Localised ?? item.Name,
          type: 'Consumable',
          mission: 0,
          stolen: 0,
          count: 0
        }
        inventoryItems.push(itemInInventory)
      }

      itemInInventory.count += item.Count
      if (item.MissionID) itemInInventory.mission += item.Count
      if (item.OwnerID > 0) itemInInventory.stolen += item.Count
    })

    shipLocker.Items.forEach(item => {
      let itemInInventory = inventoryItems.filter(i => i.name === (item?.Name_Localised ?? item.Name))[0]
      if (!itemInInventory) {
        itemInInventory = {
          name: item?.Name_Localised ?? item.Name,
          type: 'Goods',
          mission: 0,
          stolen: 0,
          count: 0
        }
        inventoryItems.push(itemInInventory)
      }

      itemInInventory.count += item.Count
      if (item.MissionID) itemInInventory.mission += item.Count
      if (item.OwnerID > 0) itemInInventory.stolen += item.Count
    })

    shipLocker.Components.forEach(item => {
      let itemInInventory = inventoryItems.filter(i => i.name === (item?.Name_Localised ?? item.Name))[0]
      if (!itemInInventory) {
        itemInInventory = {
          name: item?.Name_Localised ?? item.Name,
          type: 'Component',
          mission: 0,
          stolen: 0,
          count: 0
        }
        inventoryItems.push(itemInInventory)
      }

      itemInInventory.count += item.Count
      if (item.MissionID) itemInInventory.mission += item.Count
      if (item.OwnerID > 0) itemInInventory.stolen += item.Count
    })

    shipLocker.Data.forEach(item => {
      let itemInInventory = inventoryItems.filter(i => i.name === (item?.Name_Localised ?? item.Name))[0]
      if (!itemInInventory) {
        itemInInventory = {
          name: item?.Name_Localised ?? item.Name,
          type: 'Data',
          mission: 0,
          stolen: 0,
          count: 0
        }
        inventoryItems.push(itemInInventory)
      }

      itemInInventory.count += item.Count
      if (item.MissionID) itemInInventory.mission += item.Count
      if (item.OwnerID > 0) itemInInventory.stolen += item.Count
    })

    inventoryItems.sort((a, b) => a.name.localeCompare(b.name))

    const counts = {
      goods: 0,
      components: 0,
      data: 0,
    }

    inventoryItems.filter(i => i.type === 'Goods').forEach(item => counts.goods += item.count)
    inventoryItems.filter(i => i.type === 'Component').forEach(item => counts.components += item.count)
    inventoryItems.filter(i => i.type === 'Data').forEach(item => counts.data += item.count)

    return {
      counts,
      items: inventoryItems
    }
  }
}

module.exports = Inventory
