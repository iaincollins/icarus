import PanelNavigation from 'components/panel-navigation'

export default function Panel ({ children, layout = 'full-width', scrollable = false, navigationItems }) {
  return (
    <div className={`layout__${layout} ${scrollable ? 'scrollable' : ''} ${(navigationItems && navigationItems.length > 0) ? 'layout__panel--secondary-navigation' : '' }`}>
      {navigationItems && navigationItems.length > 0 &&
        <PanelNavigation items={navigationItems} />
      }
      {children}
    </div>
  )
}
