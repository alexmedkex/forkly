import * as AsyncPolling from 'async-polling'

import { injectable } from 'inversify'

import IPollingServiceFactory from './IPollingServiceFactory'
import IService from '../business-layer/IService'

@injectable()
export default class PollingServiceFactory implements IPollingServiceFactory {
  public createPolling(pollingFunction: (end) => void, intervalMs: number): IService {
    const asyncPolling = AsyncPolling(pollingFunction, intervalMs)
    return {
      start: () => asyncPolling.run(),
      stop: () => asyncPolling.stop()
    }
  }
}
