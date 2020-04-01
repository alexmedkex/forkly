import { ErrorCode } from '@komgo/error-utilities'
import { getLogger } from '@komgo/logging'
import { NotificationLevel } from '@komgo/notification-publisher'
import { inject, injectable } from 'inversify'

import DocumentDataAgent from '../../../data-layer/data-agents/DocumentDataAgent'
import SharedDocumentsDataAgent from '../../../data-layer/data-agents/SharedDocumentsDataAgent'
import { IDocument } from '../../../data-layer/models/document'
import { IDocumentFeedback, ISharedDocuments } from '../../../data-layer/models/shared-documents'
import { CompaniesRegistryClient } from '../../../infrastructure/api-registry/CompaniesRegistryClient'
import { MetricNames, Directions } from '../../../infrastructure/metrics/consts'
import { metric } from '../../../infrastructure/metrics/metrics'
import { TYPES } from '../../../inversify/types'
import { forEachAsync, doIdsMatch } from '../../../utils'
import { ErrorName } from '../../../utils/ErrorName'
import { IDocumentFeedbackNotification } from '../../notifications/IDocumentFeedbackNotification'
import { NotificationClient } from '../../notifications/NotificationClient'
import { EVENT_NAME, FEEDBACK_STATUS, NOTIFICATION_TYPE } from '../enums'
import { DocumentFeedbackData } from '../messages/DocumentFeedbackData'
import { DocumentFeedbackMessage } from '../messages/DocumentFeedbackMessage'

import { IEventProcessor } from './IEventProcessor'

const documentFeedbackMetric = metric(MetricNames.DocumentFeedbackSent)

/**
 * Processes document request feedback events.
 */
@injectable()
export class DocumentFeedbackProcessor implements IEventProcessor<DocumentFeedbackMessage> {
  private readonly logger = getLogger('DocumentFeedbackProcessor')

  constructor(
    @inject(TYPES.DocumentDataAgent) private readonly documentDataAgent: DocumentDataAgent,
    @inject(TYPES.NotificationClient) private readonly notificationClient: NotificationClient,
    @inject(TYPES.CompaniesRegistryClient) private readonly companiesRegistryClient: CompaniesRegistryClient,
    @inject(TYPES.SharedDocumentsDataAgent) private readonly shareDocumentDataAgent: SharedDocumentsDataAgent
  ) {}

  async processEvent(senderStaticId: string, event: DocumentFeedbackMessage): Promise<void> {
    this.logger.info('Processing document feedback message', { senderStaticId })
    await this.sendNotifications(senderStaticId, event)
    await this.storeDocumentFeedback(event)

    documentFeedbackMetric.record(Directions.Inbound)
    this.logger.info('Processed document feedback message', { senderStaticId })
  }

  eventNames(): string[] {
    return [EVENT_NAME.SendDocumentFeedback]
  }

  eventType(): any {
    return DocumentFeedbackMessage
  }

  private async sendNotifications(senderStaticId: string, event: DocumentFeedbackMessage) {
    await forEachAsync(event.data.documents, async document => {
      // KOMGO-2671: At this stage, only the notifications of rejection should be displayed
      if (document.status === FEEDBACK_STATUS.Rejected) {
        const notification: IDocumentFeedbackNotification = await this.createNotificationMessage(
          senderStaticId,
          document,
          event.context.productId
        )
        await this.notificationClient.sendNotification(notification)
      }
    })
  }

  private async createNotificationMessage(
    senderStaticId: string,
    documentFeedback: DocumentFeedbackData,
    productId: string
  ): Promise<IDocumentFeedbackNotification> {
    const companyName = await this.companiesRegistryClient.getCompanyNameByStaticId(senderStaticId)
    const documentName = await this.getDocumentName(productId, documentFeedback.id)

    return {
      productId,
      type: NOTIFICATION_TYPE.DocumentInfo,
      level: NotificationLevel.info,
      requiredPermission: {
        productId,
        actionId: 'manageDocRequest'
      },
      context: {
        companyId: senderStaticId
      },
      message: this.createMessageInfo(companyName, documentName, documentFeedback)
    }
  }
  private async getDocumentName(productId: string, id: string): Promise<string> {
    const document: IDocument = await this.documentDataAgent.getBareById(productId, id)
    if (!document) return '<unknown>'

    return document.name
  }

  private createMessageInfo(companyName: string, documentName: string, documentFeedback: DocumentFeedbackData) {
    // KOMGO-2671: Commented, not sure if it is going to last for long time
    // if (documentFeedback.status === FEEDBACK_STATUS.Accepted) {
    //   return `Document "${documentName}" approved by ${companyName}`
    // }

    let notificationMessage: string = `Document "${documentName}" refused by ${companyName}`
    if (documentFeedback.notes) {
      notificationMessage += `. ${documentFeedback.notes}.`
    }
    return notificationMessage
  }

  private async storeDocumentFeedback(event: DocumentFeedbackMessage) {
    const shareDocument = await this.shareDocumentDataAgent.getBareById(event.context.productId, event.data.shareId)
    if (shareDocument) {
      if (!doIdsMatch(event.data.documents.map(doc => doc.id), shareDocument.documents.map(doc => doc.documentId))) {
        this.logger.error(
          ErrorCode.DatabaseInvalidData,
          ErrorName.SendDocumentFeedbackError,
          'Document feedback - document ids mismatch',
          {
            productId: event.context.productId,
            documentIds: event.data.documents.map(doc => doc.id),
            shareId: event.data.shareId
          }
        )

        return
      }
      shareDocument.feedbackReceived = true
      shareDocument.documents = await this.convertDocumentFeedback(event.data.documents, shareDocument)
      this.shareDocumentDataAgent.update(event.context.productId, shareDocument)
    }
  }

  private async convertDocumentFeedback(documentFeedbacks: DocumentFeedbackData[], sharedDocuments: ISharedDocuments) {
    const documents: IDocumentFeedback[] = await Promise.all(
      documentFeedbacks.map(async document => {
        const sharedDoc = sharedDocuments.documents.find(x => x.documentId === document.id)
        sharedDoc.note = document.notes
        sharedDoc.status = document.status
        sharedDoc.newVersionRequested = document.newVersionRequested
        return sharedDoc
      })
    )
    return documents
  }
}
