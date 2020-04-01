import { inject, injectable } from 'inversify'
import { ILetterOfCredit, IDataLetterOfCredit } from '@komgo/types'
import { ErrorCode } from '@komgo/error-utilities'
import { getLogger } from '@komgo/logging'

import { TYPES } from '../../../inversify'
import { ErrorNames } from '../../../exceptions/utils'

import { ILetterOfCreditMessagingService } from './ILetterOfCreditMessagingService'
import { ILetterOfCreditMessagePayload, MessageType } from './ILetterOfCreditMessageType'
import { IMessagePublishingService } from '../../message-processing/IMessagePublishingService'

@injectable()
export class LetterOfCreditMessagingService implements ILetterOfCreditMessagingService {
  private readonly logger = getLogger('LetterOfCreditMessagingService')
  private readonly routingkey: string = process.env.OUTBOUND_ROUTING_KEY || 'komgo-internal'

  constructor(@inject(TYPES.MessagePublisher) private readonly publisher: IMessagePublishingService) {}

  async sendMessageTo(partyStaticId: string, lc: ILetterOfCredit<IDataLetterOfCredit>): Promise<string> {
    this.logger.info(`About to send a letter of credit message to ${partyStaticId}`)
    const messagePayload: ILetterOfCreditMessagePayload = this.getLetterOfCreditMessagePayload(lc)
    try {
      const result = await this.publisher.publish(this.routingkey, messagePayload, {
        recipientStaticId: partyStaticId
      })
      this.logger.info('Letter of credit message sent successfully')
      return result.messageId
    } catch (error) {
      this.logger.error(ErrorCode.ConnectionInternalMQ, ErrorNames.PublishLetterOfCreditToMQFailed, error.message)
      throw new Error('Failed to publish letter of credit message')
    }
  }

  getLetterOfCreditMessagePayload(lc: ILetterOfCredit<IDataLetterOfCredit>): ILetterOfCreditMessagePayload {
    return {
      ...lc,
      messageType: MessageType.LetterOfCredit
    }
  }
}
