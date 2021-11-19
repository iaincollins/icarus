
export default function Panel ({ children, visible }) {
  return (
    <div className='panel' style={{ opacity: visible ? 1 : 0 }}>
      {children}
    </div>
  )
}

Panel.defaultProps = {
  visible: true
}
