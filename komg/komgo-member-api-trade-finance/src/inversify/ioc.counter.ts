import { Container } from 'inversify'
import { TYPES } from './types'

import { CounterService, ICounterService } from '../business-layer/counter'
import { CounterDataAgent, ICounterDataAgent } from '../data-layer/data-agents'

export const registerCounterComponents = (container: Container) => {
  container.bind<ICounterService>(TYPES.CounterService).to(CounterService)
  container.bind<ICounterDataAgent>(TYPES.CounterDataAgent).to(CounterDataAgent)
}
