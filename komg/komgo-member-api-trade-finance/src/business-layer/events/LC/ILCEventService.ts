import { ILC } from '../../../data-layer/models/ILC'

export interface ILCEventService {
  doEvent(lc: ILC, decodedEvent: any, rawEvent: any)
}
