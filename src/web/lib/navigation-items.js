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
      name: 'Materials',
      icon: 'materials',
      url: '/eng/materials'
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
