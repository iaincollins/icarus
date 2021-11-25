import { toggleFullScreen } from 'lib/window'

export default function Toolbar ({ connected }) {
  return (
    <>
      <h2 style={{ padding: '1rem 0' }}> ICARUS Terminal</h2>
      <div style={{ position: 'absolute', top: '1rem', right: '1rem' }}>
        <button disabled className='button-with-icon button-transparent' style={{ opacity: 1, marginRight: '.5rem' }}>
          <i className={`icarus-terminal-signal ${connected ? 'text-primary' : 'text-danger text-blink'}`} />
        </button>
        <button onClick={toggleFullScreen} className='button-with-icon'>
          <i className='icarus-terminal-fullscreen' />
        </button>
      </div>
    </>
  )
}
