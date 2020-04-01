import io from 'socket.io-client'
import authService from './utils/AutheticationService'
import { getRealmName } from './utils/user-storage'

const functionType = {}

/**
 * @event action - triggers redux action directly using dispatch({ type, payload })
 * @event function - triggers redux action with function
 */
export const connectSocket = (dispatch: any, data) => {
  const socket = io(process.env.REACT_APP_API_GATEWAY_URL)
  socket.on('connect', async () => {
    const realmName = getRealmName()
    socket.emit('authenticate', { token: await authService(realmName).getJWT() })
  })
  socket.on('authenticated', () => {
    socket.on('action', dispatch)
    socket.on('function', ({ name, payload }) => {
      const f = functionType[name]
      if (typeof f === 'function') {
        dispatch(f(payload))
      }
    })
  })
}
