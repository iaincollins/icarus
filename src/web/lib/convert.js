function kelvinToCelius (kelvin) { return kelvin - 273 }
function celiusToFahrenheit (celcius) { return Math.floor(celcius * (9 / 5) + 32) }
function kelvinToFahrenheit (kelvin) { return celiusToFahrenheit(kelvinToCelius(kelvin)) }

module.exports = {
  kelvinToCelius,
  celiusToFahrenheit,
  kelvinToFahrenheit
}
