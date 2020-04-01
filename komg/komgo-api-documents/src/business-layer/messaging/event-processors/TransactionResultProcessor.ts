import { ErrorCode } from '@komgo/error-utilities'
import { getLogger } from '@komgo/logging'
import { MessagingFactory, IMessagePublisher } from '@komgo/messaging-library'
import { SendTxResultMessage, TransactionStatus } from '@komgo/messaging-types'
import { inject, injectable } from 'inversify'

import DocumentDataAgent from '../../../data-layer/data-agents/DocumentDataAgent'
import InvalidOperation from '../../../data-layer/data-agents/exceptions/InvalidOperation'
import { DocumentState } from '../../../data-layer/models/ActionStates'
import { IDocument } from '../../../data-layer/models/document'
import { MetricNames } from '../../../infrastructure/metrics/consts'
import { metric } from '../../../infrastructure/metrics/metrics'
import { CONFIG_KEYS } from '../../../inversify/config_keys'
import { TYPES } from '../../../inversify/types'
import { IClassType } from '../../../utils'
import { ErrorName } from '../../../utils/ErrorName'
import { EVENT_NAME, DOCUMENT_STATE_EVENT } from '../enums'

import { IEventProcessor } from './IEventProcessor'
import InvalidMessage from './InvalidMessage'

const documentStateTransition = metric(MetricNames.DocumentState)

@injectable()
export class TransactionResultProcessor implements IEventProcessor<SendTxResultMessage> {
  private readonly logger = getLogger('TransactionResultProcessor')
  private readonly publisher: IMessagePublisher

  constructor(
    @inject(TYPES.DocumentDataAgent) private readonly documentDataAgent: DocumentDataAgent,
    @inject(TYPES.MessagingFactory) private readonly messagingFactory: MessagingFactory,
    @inject(CONFIG_KEYS.ToWebSocketPublisherId) private readonly wsPublisherId: string
  ) {
    this.logger.info('Creating a publisher with publisher id %s', this.wsPublisherId)
    this.publisher = this.messagingFactory.createPublisher(this.wsPublisherId)
  }

  async processEvent(senderStaticId: string, event: SendTxResultMessage): Promise<void> {
    this.logger.info('Processing transaction event: ', {
      event
    })
    const txId = event.txId
    const document = await this.documentDataAgent.getBareByTransactionId(txId)

    if (!document) {
      this.logger.warn(
        ErrorCode.DatabaseMissingData,
        ErrorName.DocumentByTxIdNotFound,
        'Did not find a document for a blockchain transaction',
        {
          transactionId: txId
        }
      )
      return
    }

    await this.updateDocumentStatus(document, event)
  }

  eventNames(): string[] {
    return [EVENT_NAME.BlockchainTransactionError, EVENT_NAME.BlockchainTransactionSuccess]
  }

  eventType(): IClassType<SendTxResultMessage> {
    return SendTxResultMessage
  }

  private async updateDocumentStatus(document: IDocument, event: SendTxResultMessage): Promise<void> {
    this.logger.info('Updating status of document %s', document.id)
    const newState = event.status === TransactionStatus.Confirmed ? DocumentState.Registered : DocumentState.Failed

    try {
      const updated: IDocument = await this.documentDataAgent.updateDocumentState(
        document.productId,
        document.id,
        newState
      )

      documentStateTransition.record(newState)

      const userId = document.uploadInfo !== undefined ? document.uploadInfo.uploaderUserId : undefined
      await this.notifyUserDocStateChange(userId, document, updated.state)
    } catch (e) {
      if (e instanceof InvalidOperation) {
        throw new InvalidMessage(`Failed to update document status - ${e.message}`)
      }
      throw e
    }
  }

  private async notifyUserDocStateChange(userId: string, doc: IDocument, docState: string) {
    if (!userId) {
      this.logger.error(
        ErrorCode.ConnectionMicroservice,
        ErrorName.UsersError,
        'Unable to send UI notification, no user id available'
      )
      return
    }

    this.logger.info('Sending notification', { userId })

    const uiWebSocketAction =
      docState === DocumentState.Registered
        ? DOCUMENT_STATE_EVENT.RegisteredSuccess
        : DOCUMENT_STATE_EVENT.RegisteredError

    const content = {
      recipient: userId,
      type: uiWebSocketAction,
      payload: { id: doc.id, state: docState, name: doc.name }
    }

    this.logger.info('Websocket message content', { content })

    try {
      const publishedResult = await this.publisher.publish(EVENT_NAME.InternalWsAction, content)

      this.logger.info('Notifying UI with', { publishedResult })
    } catch (pe) {
      this.logger.error(
        ErrorCode.ConnectionInternalMQ,
        ErrorName.SendMessageError,
        'Failed to send WebSocket message for Document',
        {
          errorMessage: pe.message
        }
      )
    }
  }
}
