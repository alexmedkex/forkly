import { Server } from '@komgo/microservice-config'

import { RegisterRoutes } from '../src/middleware/server-config/routes'

const server = new Server()

RegisterRoutes(server.express)
let serverInstance

export const startService = async () => {
  try {
    serverInstance = await server.withErrorHandlers().startOn(8081)
  } catch (error) {
    console.log('Error when starting service to listen from Internal-MQ')
    console.log(error)
  }
  console.log('Service started')
}

export const stopService = async () => {
  try {
    if (serverInstance && typeof serverInstance.close === 'function') {
      await serverInstance.close()
    }
  } catch (error) {
    console.log('Error when stopping service')
    console.log(error)
  }
  console.log('Service stopped')
}
