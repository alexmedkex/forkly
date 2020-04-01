import { configureLogging, LogLevel } from '@komgo/logging'

import { iocContainer } from './inversify/ioc'
import { TYPES } from './inversify/types'
import { Server } from './service/Server'

configureLogging('ws-server', LogLevel.Info, true)

const server = iocContainer.get<Server>(TYPES.Server)
server.connect()
