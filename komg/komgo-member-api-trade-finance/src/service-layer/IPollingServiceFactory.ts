import IService from '../business-layer/IService'

export default interface IPollingServiceFactory {
  createPolling(pollingFunction: (end) => void, intervalMs: number): IService
}
