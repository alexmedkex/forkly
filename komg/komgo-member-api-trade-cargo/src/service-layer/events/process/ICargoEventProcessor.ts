import { ICargoData } from '../../../business-layer/data/request-messages/ICargoData'

export interface ICargoEventProcessor {
  processEvent(cargoData: ICargoData, source: string)
}
