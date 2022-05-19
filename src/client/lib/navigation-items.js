function ShipPanelNavItems (activePanel) {
  const navigationItems = [
    {
      name: 'Status',
      icon: 'ship',
      url: '/ship/status'
    },
    {
      name: 'Cargo',
      icon: 'cargo',
      url: '/ship/cargo'
    },
    {
      name: 'Inventory',
      icon: 'inventory',
      url: '/ship/inventory'
    }
  ]
  navigationItems.forEach(item => {
    if (item.name.toLowerCase() === activePanel.toLowerCase()) item.active = true
  })
  return navigationItems
}

function NavPanelNavItems (activePanel, query) {
  const navigationItems = [
    {
      name: 'Search',
      icon: 'search',
      type: 'SEARCH'
    },
    {
      name: 'Map',
      icon: 'system-bodies',
      url: {
        pathname: '/nav/map',
        query
      }
    },
    {
      name: 'List',
      icon: 'table-inspector',
      url: {
        pathname: '/nav/list',
        query
      }
    },
    {
      name: 'Route',
      icon: 'route',
      url: {
        pathname: '/nav/route',
        query
      }
    }
  ]
  navigationItems.forEach(item => {
    if (item.name.toLowerCase() === activePanel.toLowerCase()) item.active = true
  })
  return navigationItems
}

function EngineeringPanelNavItems (activePanel) {
  const navigationItems = [
    {
      name: 'Blueprints',
      icon: 'engineering',
      url: '/eng/blueprints'
    },
    {
      name: 'Engineers',
      icon: 'engineer',
      url: '/eng/engineers'
    },
    {
      name: 'Raw Materials',
      icon: 'materials-raw',
      url: '/eng/raw-materials'
    },
    {
      name: 'Manufactured Materials',
      icon: 'materials-manufactured',
      url: '/eng/manufactured-materials'
    },
    {
      name: 'Encoded Materials',
      icon: 'materials-encoded',
      url: '/eng/encoded-materials'
    },
    {
      name: 'Xeno Materials',
      icon: 'materials-xeno',
      url: '/eng/xeno-materials'
    }
  ]
  navigationItems.forEach(item => {
    if (item.name.toLowerCase() === activePanel.toLowerCase()) item.active = true
  })
  return navigationItems
}


function SettingsNavItems (activePanel) {
  const navigationItems = [
    {
      name: 'Theme',
      icon: 'color-picker',
    },
    {
      name: 'Sounds',
      icon: 'cogs',
    },
  ]
  navigationItems.forEach(item => {
    if (item.name.toLowerCase() === activePanel.toLowerCase()) item.active = true
  })
  return navigationItems
}


module.exports = {
  ShipPanelNavItems,
  NavPanelNavItems,
  EngineeringPanelNavItems,
  SettingsNavItems
}
