import { injectable, inject } from 'inversify'

import { IMessageReceived } from '@komgo/messaging-library'
import { ErrorCode } from '@komgo/error-utilities'
import { getLogger } from '@komgo/logging'
import { TYPES } from '../../../inversify/types'
import { ErrorNames } from '../../../exceptions/utils'

import { IMessageEventProcessor } from '../../message-processing/IMessageEventProcessor'

import { MessageType, ILetterOfCreditMessagePayload } from '../messaging/ILetterOfCreditMessageType'
import { ILetterOfCreditReceivedService } from '../services/ILetterOfCreditReceivedService'

@injectable()
export class LetterOfCreditMessageProcessor implements IMessageEventProcessor {
  private logger = getLogger('LetterOfCreditMessageProcessor')
  private readonly messageProcessors: { [id: string]: ILetterOfCreditReceivedService } = {}

  constructor(
    @inject(TYPES.LetterOfCreditReceivedService) letterOfCreditReceivedService: ILetterOfCreditReceivedService
  ) {
    this.messageProcessors[MessageType.LetterOfCredit] = letterOfCreditReceivedService
  }

  getKeysToProcess(): Promise<string[]> {
    return Promise.resolve(Object.values(MessageType))
  }

  async processEvent(message: IMessageReceived) {
    const messageContent = message.content as ILetterOfCreditMessagePayload
    const eventProcessor = this.messageProcessors[messageContent.messageType]
    if (!eventProcessor) {
      this.logger.warn(
        ErrorCode.ValidationInternalAMQP,
        ErrorNames.DocumentEventProcessorNotFound,
        `Can't find message processor`,
        {
          messageType: messageContent.messageType,
          messageId: message.options.messageId
        }
      )
      throw new Error('undefined message processor')
    }
    try {
      await eventProcessor.processEvent(messageContent)
    } catch (err) {
      this.logger.info('Error processing letter of credit', {
        error: ErrorNames.EventProcessingLetterOfCreditFailed,
        messageType: messageContent.messageType,
        messageId: message.options.messageId,
        errorObject: err
      })
      throw err
    }
  }
}
