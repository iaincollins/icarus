export default function PanelNavigation ({ items = [] }) {
  return (
    <div className='secondary-navigation'>
    {items.map(item => 
      <button tabIndex='1' className={`button--icon ${item.active === true ? 'button--active' : ''}`} onClick={item.onClick}>
        <i className={`icon icarus-terminal-${item.icon}`} />
      </button>
    )}
    </div>
  )
}