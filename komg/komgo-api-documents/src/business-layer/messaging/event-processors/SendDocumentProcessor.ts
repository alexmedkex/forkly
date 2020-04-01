import { getLogger } from '@komgo/logging'
import { DocumentRoutingKeyFactory, DocumentRoutingKeyPrefix, IDocumentReceivedMessage } from '@komgo/messaging-types'
import { TaskStatus, INotificationCreateRequest, NotificationLevel } from '@komgo/notification-publisher'
import { inject, injectable } from 'inversify'

import CategoryDataAgent from '../../../data-layer/data-agents/CategoryDataAgent'
import ReceivedDocumentsDataAgent from '../../../data-layer/data-agents/ReceivedDocumentsDataAgent'
import TypeDataAgent from '../../../data-layer/data-agents/TypeDataAgent'
import { IDocumentReview, IReceivedDocuments } from '../../../data-layer/models/received-documents'
import { CompaniesRegistryClient } from '../../../infrastructure/api-registry/CompaniesRegistryClient'
import { MetricNames, Directions } from '../../../infrastructure/metrics/consts'
import { metric } from '../../../infrastructure/metrics/metrics'
import { TYPES } from '../../../inversify/types'
import { forEachAsync } from '../../../utils'
import { NotificationClient } from '../../notifications/NotificationClient'
import { receivedDocumentsContext } from '../../tasks/context-utils'
import { IReceivedDocumentsTask } from '../../tasks/IReceivedDocumentsTask'
import { TaskClient } from '../../tasks/TaskClient'
import { EVENT_NAME, FEEDBACK_STATUS, TASK_TYPE, NOTIFICATION_TYPE } from '../enums'
import { DocumentMessageData, SendDocumentsMessage } from '../messages'
import { InternalDocumentMessageData } from '../messages/InternalDocumentMessageData'
import { RabbitMQPublishingClient } from '../RabbitMQPublishingClient'

import { DocumentProcessorUtils } from './DocumentProcessorUtils'
import { IEventProcessor } from './IEventProcessor'

const documentSent = metric(MetricNames.DocumentRequestSent)

/**
 * Processes document requests events.
 */
@injectable()
export class SendDocumentProcessor implements IEventProcessor<SendDocumentsMessage> {
  private readonly logger = getLogger('SendDocumentProcessor')

  constructor(
    @inject(TYPES.TaskClient) private readonly taskClient: TaskClient,
    @inject(TYPES.ReceivedDocumentsDataAgent) private readonly receivedDocumentsDataAgent: ReceivedDocumentsDataAgent,
    @inject(TYPES.CompaniesRegistryClient) private readonly companiesRegistryClient: CompaniesRegistryClient,
    @inject(TYPES.RabbitMQInternalPublishingClient) private readonly rabbitMQPublishingClient: RabbitMQPublishingClient,
    @inject(TYPES.CategoryDataAgent) private readonly categoryDataAgent: CategoryDataAgent,
    @inject(TYPES.TypeDataAgent) private readonly typeDataAgent: TypeDataAgent,
    @inject(TYPES.DocumentProcessorUtils) private readonly documentProcessorUtils: DocumentProcessorUtils,
    @inject(TYPES.NotificationClient) private readonly notificationClient: NotificationClient
  ) {}

  async processEvent(senderStaticId: string, event: SendDocumentsMessage): Promise<void> {
    this.logger.info('Processing received documents message with %d documents', event.data.documents.length, {
      senderStaticId
    })
    await this.documentProcessorUtils.storeNewDocuments(senderStaticId, event.context.productId, event.data.documents)

    const receivedDocuments = await this.receivedDocumentsDataAgent.create(
      event.context.productId,
      this.convertFromEvent(senderStaticId, event)
    )

    if (!event.data.reviewNotRequired) {
      await this.createTask(senderStaticId, receivedDocuments)
    }

    if (event.data.documentShareNotification) {
      await this.createNotifications(senderStaticId, receivedDocuments)
    }

    if (event.context) {
      await this.sendInternalMessage(senderStaticId, event)
    }

    documentSent.record(Directions.Inbound)
  }

  eventNames(): string[] {
    return [EVENT_NAME.SendDocuments]
  }

  eventType(): any {
    return SendDocumentsMessage
  }

  private async createNotifications(senderStaticId: string, incomingRequest: IReceivedDocuments) {
    await forEachAsync(incomingRequest.documents, async document => {
      const notification: INotificationCreateRequest = await this.createNotificationMessage(
        senderStaticId,
        document,
        incomingRequest.productId
      )

      await this.notificationClient.sendNotification(notification)
    })
  }

  private async createTask(senderStaticId: string, incomingRequest: IReceivedDocuments) {
    this.logger.info('Fetching company name by sender static id', { senderStaticId })
    const companyName = await this.companiesRegistryClient.getCompanyNameByStaticId(senderStaticId)
    const summary = `${incomingRequest.documents.length} document(s) received from ${companyName}`

    const newTask: IReceivedDocumentsTask = this.createDocumentReceivedTask(senderStaticId, summary, incomingRequest)
    await this.taskClient.createTask(newTask, summary)
  }

  private async createNotificationMessage(
    senderStaticId: string,
    document: IDocumentReview,
    productId: string
  ): Promise<INotificationCreateRequest> {
    const companyName = await this.companiesRegistryClient.getCompanyNameByStaticId(senderStaticId)
    const message = `You have received a trade document from ${companyName}, click here to view it`
    return {
      productId,
      type: NOTIFICATION_TYPE.TradeFinanceDocumentShare,
      level: NotificationLevel.info,
      requiredPermission: {
        productId,
        actionId: 'manageDocument'
      },
      context: {
        documentId: document.documentId
      },
      message
    }
  }

  private createDocumentReceivedTask(
    senderStaticId: string,
    summaryInput: string,
    receivedDocuments: IReceivedDocuments
  ): IReceivedDocumentsTask {
    return {
      summary: summaryInput,
      taskType: TASK_TYPE.DocumentsReview,
      status: TaskStatus.ToDo,
      counterpartyStaticId: senderStaticId,
      requiredPermission: {
        productId: receivedDocuments.productId,
        actionId: 'reviewDoc'
      },
      context: receivedDocumentsContext(receivedDocuments)
    }
  }

  private async sendInternalMessage(senderStaticId: string, event: SendDocumentsMessage) {
    const context = event.context
    const routingKey = DocumentRoutingKeyFactory.createForPublish(
      DocumentRoutingKeyPrefix.DocumentReceived,
      context.productId
    )

    // Extract content and metadata and adds type and category name
    const documents: InternalDocumentMessageData[] = []
    for (const doc of event.data.documents) {
      const newDoc = { ...doc }
      delete newDoc.content
      delete newDoc.metadata

      const type = await this.typeDataAgent.getById(doc.productId, doc.typeId)
      const category = await this.categoryDataAgent.getById(doc.productId, doc.categoryId)
      newDoc.typeName = type.name
      newDoc.categoryName = category.name

      documents.push(newDoc)
    }

    const msg: IDocumentReceivedMessage = { context, documents, senderStaticId }
    await this.rabbitMQPublishingClient.sendInternalMessage(routingKey, msg)
  }

  private convertFromEvent(senderStaticId: string, event: SendDocumentsMessage): IReceivedDocuments {
    const receivedDocuments = {
      context: event.data.context,
      companyId: senderStaticId,
      productId: event.context.productId,
      requestId: event.context.requestId,
      shareId: event.data.shareId,
      documents: this.convertToDocumentReview(event.data.documents),
      feedbackSent: false
    }

    return receivedDocuments as IReceivedDocuments
  }

  private convertToDocumentReview(documents: DocumentMessageData[]): IDocumentReview[] {
    return documents.map(document => {
      return {
        documentId: document.id,
        status: FEEDBACK_STATUS.Pending,
        note: '',
        reviewerId: ''
      }
    })
  }
}
