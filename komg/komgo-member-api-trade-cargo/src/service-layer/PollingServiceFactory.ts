import * as AsyncPolling from 'async-polling'

import { injectable } from 'inversify'

import IService from '../service-layer/events/IService'

import IPollingServiceFactory from './IPollingServiceFactory'

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
