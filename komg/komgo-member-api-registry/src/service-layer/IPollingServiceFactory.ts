import IService from '../service-layer/events/IService'

export default interface IPollingServiceFactory {
  createPolling(pollingFunction: (end) => void, intervalMs: number): IService
}
