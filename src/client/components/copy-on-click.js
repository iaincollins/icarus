import { useRef } from 'react'
import notification from 'lib/notification'

export default function CopyOnClick ({ children, prepend, append }) {
  const selectableText = useRef()
  function copyText (e) {
    try {
      const text = selectableText.current.innerHTML
      document.execCommand('copy')
      navigator.clipboard.writeText(text)
      notification(() => <p><span className='text-primary'>text copied</span><br/><span>{`"${text}"`}</span></p>)
    } catch { /* don't care */ }
  }
  return (
    <span className='selectable selectable-wrapper' onClick={copyText}>
      {prepend}
      <span ref={selectableText} className='selectable'>{children}</span>
      {append}
    </span>
  )
}
