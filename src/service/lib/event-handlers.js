const eventHandlers = {
  debug: (message) => {
    console.log('debug', message)
    return "Debug message received"
  },
  exit: () => {
    console.log('Exit message received')
    process.exit(1)
  }
}

module.exports = eventHandlers