import createHistory from 'history/createBrowserHistory'
export const history = createHistory()

// keep track of last location
export const getLastLocation = () => lastLocation

let lastLocation = null
let currentLocation = history.location

history.listen(location => {
  lastLocation = currentLocation
  currentLocation = location
})
