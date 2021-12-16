
import { useRouter } from 'next/router'

export default function PanelNavigation ({ items = [] }) {
  const router = useRouter()

  return (
    <div className='secondary-navigation'>
      {items.map(item =>
        <button
          key={item.icon}
          tabIndex='2'
          className={`button--icon ${item.active ? 'button--active' : ''}`}
          disabled={item.active}
          onClick={
            item.onClick
              ? item.onClick
              : () => item.url ? router.push(item.url) : () => null
          }
        >
          <i className={`icon icarus-terminal-${item.icon}`} />
        </button>
      )}
    </div>
  )
}
