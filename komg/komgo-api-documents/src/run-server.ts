import { iocContainer } from './inversify/ioc'
import { TYPES } from './inversify/types'
import { runServer } from './server'
import IService from './service-layer/events/IService'

iocContainer.get<IService>(TYPES.DecoratorService).start()

runServer()
