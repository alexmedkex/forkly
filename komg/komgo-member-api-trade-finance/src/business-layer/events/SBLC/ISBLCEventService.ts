import { IStandbyLetterOfCredit } from '@komgo/types'

export interface ISBLCEventService {
  doEvent(sblc: IStandbyLetterOfCredit, decodedEvent: any, rawEvent: any)
}
