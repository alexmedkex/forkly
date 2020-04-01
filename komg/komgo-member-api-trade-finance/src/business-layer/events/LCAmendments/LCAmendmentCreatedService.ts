import { injectable } from 'inversify'
import { LCAmendmentStatus, ILCAmendment, LCAmendmentTaskType } from '@komgo/types'
import { HashMetaDomain } from '../../common/HashFunctions'
import { LCAmendmentEventServiceBase } from './LCAmendmentEventServiceBase'

@injectable()
export class LCAmendmentCreatedService extends LCAmendmentEventServiceBase {
  async doEvent(amendment: ILCAmendment, decodedEvent: any, rawEvent: any) {
    const lcAmendmentData = JSON.parse(decodedEvent.lcAmendmentData) as ILCAmendment
    const issuingBankGuid = decodedEvent.issuingBankGuid
    this.logger.info(`LCAmendmentCreated event received`, {
      lcAmendmentData
    })
    lcAmendmentData.status = LCAmendmentStatus.Requested
    try {
      this.logger.info(`Updating or creating a new amendment in local cache`)
      await this.lcAmendmentDataAgent.update(
        { staticId: lcAmendmentData.staticId },
        {
          ...lcAmendmentData,
          transactionHash: rawEvent.transactionHash,
          contractAddress: rawEvent.address
        }
      )
    } catch (error) {
      return
    }
    const hashedCompanyId = HashMetaDomain(this.companyStaticId)
    this.logger.info(
      `Checking if I am issuing bank, ${issuingBankGuid}, companyId=${
        this.companyStaticId
      }, hashedCompanyId=${hashedCompanyId}`
    )

    if (issuingBankGuid === hashedCompanyId) {
      this.logger.info(`I am issuing bank, creating task...`)
      const taskText = `Review L/C amendment for LC ${lcAmendmentData.lcReference}`
      this.createTask(lcAmendmentData, taskText, LCAmendmentTaskType.ReviewAmendment)
    }
  }
}
