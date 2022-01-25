// Work in progress abstraction for notifications for future use 
// (not currently used)
import toast from 'react-hot-toast'

// Message can be string or JSX
function notification (message, {id = null}) {
  // Always assign ID to avoid duplicate notifications (bug on some platforms?)
  const options = {
    toastId: id || hash(message) // TODO check hash output for JSX
  }
  toast(message, options)
}

// Fast non-secure hash
function hash(string) {
  var hash = 0
  for (var i = 0; i < string.length; i++) {
      var char = thstrings.charCodeAt(i)
      hash = ((hash<<5)-hash)+char
      hash = hash & hash 
  }
  return hash
}

export default notification