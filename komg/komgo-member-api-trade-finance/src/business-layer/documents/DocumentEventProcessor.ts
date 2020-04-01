import { injectable, inject } from 'inversify'
import { IMessageReceived } from '@komgo/messaging-library'
import { DocumentMessageType } from '../messaging/messageTypes'
import { getLogger } from '@komgo/logging'
import { IDocumentProcessor } from './IDocumentProcessor'
import { IDocumentEventData } from './IDocumentEventData'
import { IMessageEventProcessor } from '../message-processing/IMessageEventProcessor'
import { TYPES } from '../../inversify/types'
import { ErrorCode } from '@komgo/error-utilities'
import { ErrorNames } from '../../exceptions/utils'

@injectable()
export class DocumentEventProcessor implements IMessageEventProcessor {
  private logger = getLogger('DocumentEventProcessor')
  private readonly eventProcessors: { [id: string]: IDocumentProcessor } = {}

  constructor(
    @inject(TYPES.TradeDocumentProcessor) tradeDocumentProcessor: IDocumentProcessor | any,
    @inject(TYPES.DiscardTradeDocumentProcessor) discardDocumentProcessor: IDocumentProcessor
  ) {
    this.eventProcessors[DocumentMessageType.KomgoTradeDocument] = tradeDocumentProcessor
    this.eventProcessors[DocumentMessageType.KomgoDiscardDocument] = discardDocumentProcessor
    this.eventProcessors[DocumentMessageType.VaktDocument] = tradeDocumentProcessor
  }
  getKeysToProcess(): Promise<string[]> {
    return Promise.resolve(Object.keys(DocumentMessageType).map(key => DocumentMessageType[key]))
  }

  async processEvent(message: IMessageReceived) {
    const messageContent = message.content as IDocumentEventData
    const eventProcessor = this.eventProcessors[messageContent.messageType]
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
      return
    }
    try {
      await eventProcessor.processEvent(messageContent)
    } catch (err) {
      this.logger.info('Error processing message', {
        error: 'EventProcessingFailed',
        messageType: messageContent.messageType,
        messageId: message.options.messageId,
        vakdId: messageContent.vaktId,
        errorObject: err
      })
      throw err
    }
  }
}
