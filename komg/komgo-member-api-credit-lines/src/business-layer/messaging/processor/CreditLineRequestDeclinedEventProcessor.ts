import { getLogger } from '@komgo/logging'
import { injectable, inject } from 'inversify'

import { FeatureType } from '../../../business-layer/enums/feature'
import { TYPES } from '../../../inversify/types'
import { ICreditLineRequestService } from '../../CreditLineRequestService'
import { ICreditLineRequestMessage } from '../messages/ICreditLineRequestMessage'
import { MessageType } from '../MessageTypes'

import { IEventProcessor } from './IEventProcessor'

@injectable()
export default class CreditLineRequestDeclinedEventProcessor implements IEventProcessor<ICreditLineRequestMessage> {
  public readonly messageType = MessageType.CreditLineRequestDeclined
  protected logger = getLogger('CreditLineRequestDeclinedEventProcessor')

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

    return this.creditLineRequestService.requestDeclined(
      messageData.counterpartyStaticId,
      messageData.companyStaticId,
      messageData.context,
      messageData.requestStaticId
    )
  }
}
