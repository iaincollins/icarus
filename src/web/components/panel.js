
export default function Panel ({ children, layout = 'full-width', scrollable = false }) {
  return (
    <div className={`layout__${layout} ${scrollable ? 'scrollable' : ''}`}>
      {children}
    </div>
  )
}
