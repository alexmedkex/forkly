import { ErrorCode } from '@komgo/error-utilities'
import { getLogger } from '@komgo/logging'
import { NotificationLevel, INotificationCreateRequest } from '@komgo/notification-publisher'
import { inject, injectable } from 'inversify'
import * as _ from 'lodash'

import { RequestClient } from '../../business-layer/messaging/RequestClient'
import DocumentDataAgent from '../../data-layer/data-agents/DocumentDataAgent'
import ItemNotFound from '../../data-layer/data-agents/exceptions/ItemNotFound'
import OutgoingRequestDataAgent from '../../data-layer/data-agents/OutgoingRequestDataAgent'
import TypeDataAgent from '../../data-layer/data-agents/TypeDataAgent'
import { IDocument } from '../../data-layer/models/document'
import { IOutgoingRequest, IFullOutgoingRequest } from '../../data-layer/models/outgoing-request'
import { INote } from '../../data-layer/models/requests/INote'
import { IType, ITypeField } from '../../data-layer/models/type'
import { CompaniesRegistryClient } from '../../infrastructure/api-registry/CompaniesRegistryClient'
import { Directions, MetricNames } from '../../infrastructure/metrics/consts'
import { metric } from '../../infrastructure/metrics/metrics'
import { CONFIG_KEYS } from '../../inversify/config_keys'
import { TYPES } from '../../inversify/types'
import { Note } from '../../service-layer/request/outgoing-request/Note'
import { ErrorName } from '../../utils/ErrorName'
import { EVENT_NAME, NOTIFICATION_TYPE } from '../messaging/enums'
import { DocumentRequestMessage, TypeFieldMessageData, TypeMessageData } from '../messaging/messages'
import { DocumentMessageData } from '../messaging/messages/DocumentMessageData'
import { DocumentRequestNoteMessage, NOTE_ORIGIN } from '../messaging/messages/DocumentRequestNoteMessage'
import { NotificationClient } from '../notifications/NotificationClient'
import { documentRequestContext } from '../tasks/context-utils'

const documentRequestMetric = metric(MetricNames.DocumentRequestSent)

/**
 * A service to process document requests
 */
@injectable()
export class RequestService {
  private readonly logger = getLogger('RequestService')

  constructor(
    @inject(CONFIG_KEYS.CompanyStaticId) private readonly companyStaticId: string,
    @inject(TYPES.DocumentDataAgent) private readonly documentDataAgent: DocumentDataAgent,
    @inject(TYPES.OutgoingRequestDataAgent) private readonly requestDataAgent: OutgoingRequestDataAgent,
    @inject(TYPES.TypeDataAgent) private readonly typeDataAgent: TypeDataAgent,
    @inject(TYPES.RequestClient) private readonly requestClient: RequestClient,
    @inject(TYPES.ServiceUtils) private readonly serviceUtils,
    @inject(TYPES.CompaniesRegistryClient) private readonly companiesRegistryClient: CompaniesRegistryClient,
    @inject(TYPES.NotificationClient) private readonly notificationClient: NotificationClient
  ) {}

  /**
   * Send a document request and stores it in a local node
   *
   * @param productId product id for which this document request is sent
   * @param documentRequest document request to send
   */
  public async sendDocumentRequest(productId: string, documentRequest: IOutgoingRequest): Promise<IOutgoingRequest> {
    const createdRequest = await this.requestDataAgent.create(productId, documentRequest)

    // Send request with an id from MongoDB so we could correlated sent requests
    // const requestModel = convertRequest(createdRequest)

    // TODO: [KOMGO-912][KOMGO-1098] This can fail for many reasons such as:
    // * RabbitMQ cluster down
    // * Network partitioning
    // * Server is stopped at this point (autoscaling policy, rolling update, etc.)
    // * Application crashes
    // We need to implement a mechanism to ensure that we retry sending all
    // document requests that were stored to MongoDB database

    const requestMessage: DocumentRequestMessage = await this.createMessage(createdRequest)
    await this.requestClient.sendDocumentRequest(documentRequest.companyId, requestMessage)

    // Temporary create new notification which will be used to retrieve sent request
    await this.sendNewRequestNotification(createdRequest)

    documentRequestMetric.record(Directions.Outbound)

    return createdRequest
  }

  public async sendNote(productId: string, request: IFullOutgoingRequest, noteFromController: Note) {
    const { date, content } = noteFromController
    const sender = this.companyStaticId
    const note: INote = {
      date,
      sender,
      content
    }

    // avoid duplicated notes
    const notes: INote[] = request.notes || []
    if (_.find(notes, { date: note.date, content: note.content })) {
      this.logger.info(`Duplicated note, ignoring it`, {
        note: { ...note, content: '[retracted]' }
      })
      return
    }

    // persist message
    await this.requestDataAgent.findAndUpdate(productId, request.id, {
      $push: { notes: note }
    })

    // send rmq
    const recipient = request.companyId
    const noteToSend: DocumentRequestNoteMessage = {
      version: 1,
      messageType: EVENT_NAME.RequestDocumentsNote,
      context: {
        productId
      },
      data: {
        requestId: request.id,
        origin: NOTE_ORIGIN.OutgoingRequest,
        note: {
          date,
          sender,
          content
        }
      }
    }
    await this.requestClient.sendDocumentRequestNote(recipient, noteToSend)
  }

  private async sendNewRequestNotification(createdRequest: IOutgoingRequest) {
    this.logger.info('Creating new request notification', { requestId: createdRequest.id })

    const notification = await this.createNewRequestNotification(createdRequest)
    return this.notificationClient.sendNotification(notification)
  }

  private async createNewRequestNotification(createdRequest: IOutgoingRequest): Promise<INotificationCreateRequest> {
    const companyName = await this.companiesRegistryClient.getCompanyNameByStaticId(createdRequest.companyId)

    return {
      productId: createdRequest.productId,
      type: NOTIFICATION_TYPE.DocumentRequestCreated,
      level: NotificationLevel.info,
      requiredPermission: {
        productId: createdRequest.productId,
        actionId: 'manageDocRequest'
      },
      context: documentRequestContext(createdRequest.id),
      message: `Document request sent to ${companyName}`
    }
  }

  private async createMessage(createdRequest: IOutgoingRequest): Promise<DocumentRequestMessage> {
    const types: IType[] = await this.typeDataAgent.getTypesByIds(createdRequest.types)
    const notes: INote[] = createdRequest.notes
    let forms: IDocument[]
    if (createdRequest.forms) {
      forms = await this.getFormsToSend(createdRequest.forms)
    }
    return this.convertToMessage(createdRequest, types, notes, forms)
  }

  private async getFormsToSend(formIds: string[]): Promise<IDocument[]> {
    const formsToSend: IDocument[] = await Promise.all(
      formIds.map(async formId => {
        const form = await this.documentDataAgent.getBareById('kyc', formId)

        if (!form) {
          this.logger.error(ErrorCode.DatabaseMissingData, ErrorName.DocumentNotFoundError, 'Form not found', {
            formId
          })
          throw new ItemNotFound(`Form ${formId} was not found`)
        }

        this.logger.info('Attaching form %s in order send it to another node', formId)
        return form
      })
    )

    // Throwing exception if document size is greater than needed
    await this.serviceUtils.checkDocumentsSize(formsToSend)

    return formsToSend
  }

  private async convertToMessage(
    request: IOutgoingRequest,
    types: IType[],
    notes: INote[],
    forms?: IDocument[]
  ): Promise<DocumentRequestMessage> {
    const formsMessageData: DocumentMessageData[] = await this.serviceUtils.convertDocumentToMessages(forms)

    return {
      version: 1,
      messageType: EVENT_NAME.RequestDocuments,
      context: {
        productId: request.productId
      },
      data: {
        requestId: request.id,
        companyId: request.companyId,
        types: types.map(t => this.convertTypeToMessage(t)),
        forms: formsMessageData,
        notes,
        deadline: request.deadline
      }
    }
  }

  private convertTypeToMessage(type: IType): TypeMessageData {
    return {
      id: type.id,
      productId: type.productId,
      categoryId: type.categoryId,
      name: type.name,
      fields: type.fields ? type.fields.map(f => this.convertField(f)) : type.fields,
      predefined: type.predefined
    }
  }

  private convertField(field: ITypeField): TypeFieldMessageData {
    return {
      id: field.id,
      name: field.name,
      type: field.type,
      isArray: field.isArray
    }
  }
}
