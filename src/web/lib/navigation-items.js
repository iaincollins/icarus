function ShipPanelNavItems (activePanel) {
  const navigationItems = [
    {
      name: 'Modules',
      icon: 'ship',
      url: '/ship/modules'
    }
    /*
    {
      name: 'Engineering',
      icon: 'engineering',
      url: '/ship/engineering'
    },
    {
      name: 'Cargo',
      icon: 'table-index',
      url: '/ship/cargo'
    }
    */
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

module.exports = {
  ShipPanelNavItems,
  NavPanelNavItems
}
