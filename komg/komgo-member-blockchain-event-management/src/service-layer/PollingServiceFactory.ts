import AsyncPolling from 'async-polling'
import { injectable } from 'inversify'

import IService from './IService'

@injectable()
export default class PollingServiceFactory {
  public createPolling(pollingFunction: (end) => void, intervalMs: number): IService {
    const asyncPolling = AsyncPolling(pollingFunction, intervalMs)
    return {
      start: () => asyncPolling.run(),
      stop: () => asyncPolling.stop()
    }
  }
}
