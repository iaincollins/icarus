import notification from 'lib/notification'

export default function CopyOnClick ({ children }) {
  function copyText (e) {
    // CSS takes care of selecting element contents on click, just need to copy
    try {
      document.execCommand('copy')
      notification('Text copied to clipboard')
    } catch { /* don't care */ }
  }
  return (
    <span className='selectable' onClick={copyText}>
      {children}
    </span>
  )
}
