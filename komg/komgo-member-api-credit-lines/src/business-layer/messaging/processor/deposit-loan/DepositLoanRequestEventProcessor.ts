import { getLogger } from '@komgo/logging'
import { DepositLoanRequestType, DepositLoanRequestStatus, IDepositLoanRequest } from '@komgo/types'
import { injectable, inject } from 'inversify'

import { IDepositLoanRequestService } from '../../../../business-layer/deposit-loan/DepositLoanRequestService'
import { FeatureType } from '../../../../business-layer/enums/feature'
import { TYPES } from '../../../../inversify/types'
import { IDepositLoanRequestMessage, IDepositLoanRequestPayload } from '../../messages/IDepositLoanMessage'
import { MessageType } from '../../MessageTypes'
import { IEventProcessor } from '../IEventProcessor'

@injectable()
export default class DepositLoanRequestEventProcessor
  implements IEventProcessor<IDepositLoanRequestMessage<IDepositLoanRequestPayload>> {
  public readonly messageType = MessageType.CreditLineRequest
  protected logger = getLogger('DepositLoanRequestEventProcessor')

  constructor(
    @inject(TYPES.DepositLoanRequestService) private readonly depositLoanRequestService: IDepositLoanRequestService
  ) {}

  shouldProcess(messageData: IDepositLoanRequestMessage<IDepositLoanRequestPayload>) {
    return (
      messageData.messageType === this.messageType &&
      [FeatureType.Deposit, FeatureType.Loan].includes(messageData.featureType)
    )
  }

  async processMessage(messageData: IDepositLoanRequestMessage<IDepositLoanRequestPayload>): Promise<boolean> {
    this.logger.info('Processing message', {
      messageType: messageData.messageType,
      payload: messageData.payload,
      companyStaticId: messageData.companyStaticId,
      recepientStaticId: messageData.recepientStaticId
    })

    const request: IDepositLoanRequest = {
      requestType: DepositLoanRequestType.Received,
      status: DepositLoanRequestStatus.Pending,
      companyStaticId: messageData.companyStaticId,
      comment: messageData.payload.comment,
      staticId: undefined,
      createdAt: undefined,
      updatedAt: undefined,
      ...this.getPayload(messageData.payload)
    }

    // messageData.recepientStaticId //TODO: validate incoming req

    return this.depositLoanRequestService.requestReceived(request)
  }

  private getPayload(payload: IDepositLoanRequestPayload) {
    return {
      comment: payload.comment,
      currency: payload.currency,
      period: payload.period,
      periodDuration: payload.periodDuration,
      type: payload.type
    }
  }
}
