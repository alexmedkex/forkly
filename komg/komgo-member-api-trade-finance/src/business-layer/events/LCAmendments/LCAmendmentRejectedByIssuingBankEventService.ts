import { injectable } from 'inversify'
import { ILCAmendment, LCAmendmentStatus, LCAmendmentTaskType } from '@komgo/types'
import { LCAmendmentEventServiceBase } from './LCAmendmentEventServiceBase'
import { ILC } from '../../../data-layer/models/ILC'

@injectable()
export class LCAmendmentRejectedByIssuingBankEventService extends LCAmendmentEventServiceBase {
  async doEvent(amendment: ILCAmendment, decodedEvent: any, rawEvent: any): Promise<any> {
    this.logger.info(`Processing Transition event REJECTED_BY_ISSUING_BANK`)
    const lc = await this.lcDataAgent.getLC({ _id: amendment.lcStaticId })
    const toState: LCAmendmentStatus = LCAmendmentStatus.RejectedByIssuingBank
    if (this.iAmIssuingBank(lc)) {
      await this.processIssuingBank(amendment)
    }
    if (this.iAmApplicant(lc)) {
      await this.processApplicant(amendment)
    }
    if (!amendment.stateHistory) {
      amendment.stateHistory = []
    }
    amendment.stateHistory.push({
      fromState: amendment.status,
      date: new Date().toISOString(),
      performer: lc.issuingBankId,
      toState
    })

    amendment.status = toState
    this.logger.info(`Updating amendment=${amendment.staticId} state to ${toState}`)
    this.lcAmendmentDataAgent.update({ staticId: amendment.staticId }, amendment)
    return
  }

  private async processApplicant(amendment: ILCAmendment) {
    this.logger.info(`I am applicant, creating notification for rejection...`)
    const additionalContext = {
      rejectionComments: amendment.comment
    }
    await this.createNotification(
      amendment,
      `LC Amendment rejected by issuing bank for L/C ${amendment.lcReference}`,
      additionalContext
    )
  }

  private async processIssuingBank(amendment: ILCAmendment) {
    this.logger.info(`I am issuing bank, solving my task...`)
    await this.resolveTask(amendment, LCAmendmentTaskType.ReviewAmendment, true)
  }
}
