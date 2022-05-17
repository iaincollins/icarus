
export default function MainLayout ({ children, visible }) {
  return (
    <div className='layout__main' style={{ opacity: visible ? 1 : 0 }}>
      {children}
    </div>
  )
}

MainLayout.defaultProps = {
  visible: true
}
