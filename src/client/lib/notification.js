// Work in progress abstraction for notifications for future use
// (not currently used)
import ReactDOMServer from 'react-dom/server'
import toast from 'react-hot-toast'

// Message can be string or JSX
function notification (message, args = {}) {
  let toastId = args?.id

  if (!toastId) {
    toastId = typeof message === 'string'
      ? fastHash(message)
      : fastHash(ReactDOMServer.renderToStaticMarkup(message))
  }

  // FIXME Limitation in toast library that it cannot update existing toasts in
  // in the way we need it do, and there is a bug in the toast library with
  // removing toasts by ID so we can't just remove them either. Looks like it
  // is worth exploring other libraries.

  // Always assign ID to avoid duplicate notifications (bug on some platforms?)
  const options = {
    toastId
  }

  toast(message, options)
}

// Fast non-secure hash (signed int)
function fastHash (string) {
  let hash = 0
  for (let i = 0; i < string.length; i++) {
    const char = string.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return hash
}

export default notification
