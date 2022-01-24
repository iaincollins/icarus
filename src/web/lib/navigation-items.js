function ShipPanelNavItems (activePanel) {
  const navigationItems = [
    {
      name: 'Modules',
      icon: 'ship',
      url: '/ship/modules'
    },
    {
      name: 'Cargo',
      icon: 'cargo',
      url: '/ship/cargo'
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
    },
    {
      name: 'Blueprints',
      icon: 'materials',
      url: '/eng/blueprints'
    }
  ]
  navigationItems.forEach(item => {
    if (item.name.toLowerCase() === activePanel.toLowerCase()) item.active = true
  })
  return navigationItems
}

module.exports = {
  ShipPanelNavItems,
  NavPanelNavItems,
  EngineeringPanelNavItems
}
