import { ILCAmendment } from '@komgo/types'

export interface ILCAmendmentEventService {
  doEvent(amendment: ILCAmendment, decodedEvent: any, rawEvent: any)
}
