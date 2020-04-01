import { ErrorCode } from '@komgo/error-utilities'
import { getLogger } from '@komgo/logging'
import { inject, injectable } from 'inversify'

import { TYPES } from '../../inversify/types'
import { SendDocumentsMessage } from '../../service-layer/request/document'
import { ErrorName } from '../../utils/ErrorName'

import { DocumentRequestMessage } from './messages'
import { DocumentFeedbackMessage } from './messages/DocumentFeedbackMessage'
import { DocumentRequestDismissTypeMessage } from './messages/DocumentRequestDismissTypeMessage'
import { DocumentRequestNoteMessage } from './messages/DocumentRequestNoteMessage'
import MessagingError from './MessagingError'
import { RabbitMQPublishingClient } from './RabbitMQPublishingClient'

const SEND_DOCUMENTS_ROUTING_KEY = 'KOMGO.DOCUMENTS.SendDocuments'
const SEND_DOCUMENT_REQUEST_FEEDBACK_ROUTING_KEY = 'KOMGO.DOCUMENTS.SendDocumentFeedback'
const REQUEST_DOCUMENTS_ROUTING_KEY = 'KOMGO.DOCUMENTS.RequestDocuments'
const REQUEST_DOCUMENTS_NOTES_ROUTING_KEY = 'KOMGO.DOCUMENTS.RequestDocumentsNotes'
const REQUEST_DOCUMENTS_DISMISS_TYPE_ROUTING_KEY = 'KOMGO.DOCUMENTS.RequestDocumentsDismissedTypes'

@injectable()
export class RequestClient {
  private readonly logger = getLogger('RequestClient')

  constructor(@inject(TYPES.RabbitMQPublishingClient) private readonly publishingClient: RabbitMQPublishingClient) {}

  public async sendDocumentRequest(companyId: string, documentRequest: DocumentRequestMessage): Promise<void> {
    try {
      await this.publishingClient.sendMessage(REQUEST_DOCUMENTS_ROUTING_KEY, companyId, documentRequest)
    } catch (error) {
      this.logger.error(
        ErrorCode.ConnectionInternalMQ,
        ErrorName.SendDocumentRequestError,
        'Failed to send document request',
        {
          requestId: documentRequest.data.requestId,
          companyId
        }
      )
      this.processException(error)
    }
  }

  public async sendDocuments(companyId: string, sendDocumentsMessage: SendDocumentsMessage): Promise<void> {
    try {
      await this.publishingClient.sendMessage(SEND_DOCUMENTS_ROUTING_KEY, companyId, sendDocumentsMessage)
    } catch (error) {
      this.logger.error(ErrorCode.ConnectionInternalMQ, ErrorName.SendDocumentError, 'Failed to send document(s)', {
        numberOfDocuments: sendDocumentsMessage.data.documents.length,
        companyId
      })
      this.processException(error)
    }
  }

  public async sendDocumentRequestDismissType(
    companyId: string,
    dismissalMessage: DocumentRequestDismissTypeMessage
  ): Promise<void> {
    try {
      await this.publishingClient.sendMessage(REQUEST_DOCUMENTS_DISMISS_TYPE_ROUTING_KEY, companyId, dismissalMessage)
    } catch (error) {
      this.logger.error(
        ErrorCode.ConnectionInternalMQ,
        ErrorName.SendDocumentRequestDismissedTypesError,
        'Failed to send document types dismissal message',
        {
          requestId: dismissalMessage.data.requestId,
          companyId,
          errorMessage: error.message
        }
      )
      this.processException(error)
    }
  }

  public async sendDocumentFeedback(
    companyId: string,
    documentFeedbackMessage: DocumentFeedbackMessage
  ): Promise<void> {
    try {
      await this.publishingClient.sendMessage(
        SEND_DOCUMENT_REQUEST_FEEDBACK_ROUTING_KEY,
        companyId,
        documentFeedbackMessage
      )
    } catch (error) {
      const requestId = documentFeedbackMessage.data.requestId ? documentFeedbackMessage.data.requestId : null
      this.logger.error(
        ErrorCode.ConnectionInternalMQ,
        ErrorName.SendDocumentFeedbackError,
        'Failed to send document request feedback',
        {
          requestId,
          companyId,
          errorMessage: error.message
        }
      )
      this.processException(error)
    }
  }

  public async sendDocumentRequestNote(
    companyId: string,
    documentRequestNoteMessage: DocumentRequestNoteMessage
  ): Promise<void> {
    try {
      await this.publishingClient.sendMessage(
        REQUEST_DOCUMENTS_NOTES_ROUTING_KEY,
        companyId,
        documentRequestNoteMessage
      )
    } catch (error) {
      const requestId = documentRequestNoteMessage.data.requestId ? documentRequestNoteMessage.data.requestId : null
      this.logger.error(
        ErrorCode.ConnectionInternalMQ,
        ErrorName.SendDocumentRequestNoteError,
        'Failed to send document request note',
        {
          requestId,
          companyId,
          errorMessage: error.message
        }
      )
      this.processException(error)
    }
  }

  private processException(error: Error) {
    if (error instanceof MessagingError) {
      throw error
    } else {
      this.logger.error(ErrorCode.ConnectionInternalMQ, ErrorName.SendMessageError, 'Failed to send RabbitMQ message', {
        errorMessage: error.message
      })
      throw new MessagingError(error.message)
    }
  }
}
