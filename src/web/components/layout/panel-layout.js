
export default function PanelLayout ({ children, layout = 'full-width' }) {
  return (
    <div className={`layout__${layout} scrollable`}>
      {children}
    </div>
  )
}
