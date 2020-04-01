import { injectable } from 'inversify'
import { LCAmendmentEventServiceBase } from './LCAmendmentEventServiceBase'
import { ILCAmendment } from '@komgo/types'

@injectable()
export class LCAmendmentRejectionDataUpdatedEventService extends LCAmendmentEventServiceBase {
  async doEvent(amendment: ILCAmendment, decodedEvent: any, rawEvent: any): Promise<any> {
    this.logger.info(
      `LCAmendment rejection data updated for amendment=${amendment.staticId} with data=${decodedEvent.data}`
    )
    const data = decodedEvent.data
    amendment.comment = data
    await this.lcAmendmentDataAgent.update({ staticId: amendment.staticId }, amendment)
  }
}
