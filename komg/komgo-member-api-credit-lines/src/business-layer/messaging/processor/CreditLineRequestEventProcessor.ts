import { getLogger } from '@komgo/logging'
import { CreditLineRequestStatus, CreditLineRequestType, ICreditLineRequest } from '@komgo/types'
import { injectable, inject } from 'inversify'

import { FeatureType } from '../../../business-layer/enums/feature'
import { TYPES } from '../../../inversify/types'
import { ICreditLineRequestService } from '../../CreditLineRequestService'
import { ICreditLineRequestMessage } from '../messages/ICreditLineRequestMessage'
import { MessageType } from '../MessageTypes'

import { IEventProcessor } from './IEventProcessor'

@injectable()
export default class CreditLineRequestEventProcessor implements IEventProcessor<ICreditLineRequestMessage> {
  public readonly messageType = MessageType.CreditLineRequest
  protected logger = getLogger('CreditLineRequestEventProcessor')

  constructor(
    @inject(TYPES.CreditLineRequestService) private readonly creditLineRequestService: ICreditLineRequestService
  ) {}

  shouldProcess(messageData: ICreditLineRequestMessage) {
    return (
      messageData.messageType === this.messageType &&
      [FeatureType.RiskCover, FeatureType.BankLine].includes(messageData.featureType)
    )
  }

  async processMessage(messageData: ICreditLineRequestMessage): Promise<boolean> {
    this.logger.info('Processing message', {
      messageType: messageData.messageType,
      counterpartyStaticId: messageData.counterpartyStaticId,
      companyStaticId: messageData.companyStaticId,
      recepientStaticId: messageData.recepientStaticId
    })

    const request: ICreditLineRequest = {
      requestType: CreditLineRequestType.Received,
      status: CreditLineRequestStatus.Pending,
      counterpartyStaticId: messageData.counterpartyStaticId,
      companyStaticId: messageData.companyStaticId,
      context: messageData.context,
      comment: messageData.comment,
      staticId: undefined,
      createdAt: undefined,
      updatedAt: undefined
    }

    // messageData.recepientStaticId //TODO: validate incoming req

    return this.creditLineRequestService.requestReceived(request)
  }
}
