import IService from './IService'

export default interface IPollingServiceFactory {
  createPolling(pollingFunction: (end) => void, intervalMs: number): IService
}
