import { injectable } from 'inversify'
import { ILCAmendment, LCAmendmentStatus, LCAmendmentTaskType } from '@komgo/types'
import { LCAmendmentEventServiceBase } from './LCAmendmentEventServiceBase'
import { DOCUMENT_TYPE } from '../../documents/documentTypes'
import { ILC } from '../../../data-layer/models/ILC'

@injectable()
export class LCAmendmentApprovedByIssuingBankEventService extends LCAmendmentEventServiceBase {
  async doEvent(amendment: ILCAmendment, decodedEvent: any, rawEvent: any): Promise<any> {
    this.logger.info(`Processing Transition event APPROVED_BY_ISSUING_BANK`)
    const lc = await this.lcDataAgent.getLC({ _id: amendment.lcStaticId })
    const toState: LCAmendmentStatus = LCAmendmentStatus.ApprovedByIssuingBank
    if (this.iAmIssuingBank(lc)) {
      await this.processIssuingBank(amendment, lc)
    }
    if (this.iAmAdvisingBank(lc)) {
      await this.processAdvisingBank(amendment)
    }
    if (this.iAmBeneficiaryWithoutAdvising(lc)) {
      await this.processBeneficiary(amendment)
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

  private async processBeneficiary(amendment: ILCAmendment) {
    this.logger.info(`There is no advising bank and I am beneficiary, creating task...`)
    await this.createTask(
      amendment,
      `Review L/C amendment for LC ${amendment.lcReference}`,
      LCAmendmentTaskType.ReviewAmendment
    )
  }

  private async processAdvisingBank(amendment: ILCAmendment) {
    this.logger.info(`I am advising bank, creating task...`)
    await this.createTask(
      amendment,
      `Review L/C amendment for LC ${amendment.lcReference}`,
      LCAmendmentTaskType.ReviewAmendment
    )
  }

  private async processIssuingBank(amendment: ILCAmendment, lc: ILC) {
    this.logger.info(`I am issuing bank, solving my task...`)
    await this.resolveTask(amendment, LCAmendmentTaskType.ReviewAmendment, true)
    this.logger.info(`Sharing amendment issued document to parties`)
    const parties = [lc.applicantId]
    if (lc.beneficiaryBankId) {
      this.logger.info(`LC has advising bank, adding it as recipient`)
      parties.push(lc.beneficiaryBankId)
    } else {
      this.logger.info(`LC has not advising bank, adding beneficiary as recipient`)
      parties.push(lc.beneficiaryId)
    }
    this.logger.info(`Sharing with relevant parties`)
    this.lcDocumentManager.shareDocument(lc, DOCUMENT_TYPE.LC_Amendment, parties)
    this.logger.info(`Document shared with relevant parties`)
  }
}
