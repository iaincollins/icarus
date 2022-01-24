import PanelNavigation from 'components/panel-navigation'

export default function Panel ({ children, layout = 'full-width', scrollable = false, navigation, search, style = {}, className = '' }) {
  return (
    <div
      className={`layout__${layout} ${scrollable ? 'scrollable' : ''} ${(navigation && navigation.length > 0) ? 'layout__panel--secondary-navigation' : ''} ${className}`}
      style={{ ...style }}
    >
      {navigation && navigation.length > 0 &&
        <PanelNavigation items={navigation} search={search} />}
      {children}
    </div>
  )
}
