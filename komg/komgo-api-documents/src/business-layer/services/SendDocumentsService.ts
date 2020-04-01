import { ErrorCode } from '@komgo/error-utilities'
import { getLogger } from '@komgo/logging'
import { ErrorUtils } from '@komgo/microservice-config'
import { ITaskUpdateStatusRequest, TaskStatus } from '@komgo/notification-publisher'
import { inject, injectable } from 'inversify'
import { isEqual, isMatch } from 'lodash'

import DocumentDataAgent from '../../data-layer/data-agents/DocumentDataAgent'
import InvalidItem from '../../data-layer/data-agents/exceptions/InvalidItem'
import ItemNotFound from '../../data-layer/data-agents/exceptions/ItemNotFound'
import IncomingRequestDataAgent from '../../data-layer/data-agents/IncomingRequestDataAgent'
import SharedDocumentsDataAgent from '../../data-layer/data-agents/SharedDocumentsDataAgent'
import { DocumentState } from '../../data-layer/models/ActionStates'
import { IDocument, IFullDocument } from '../../data-layer/models/document'
import { IIncomingRequest } from '../../data-layer/models/incoming-request'
import { ISharedDocuments, IDocumentFeedback } from '../../data-layer/models/shared-documents'
import { CompaniesRegistryClient } from '../../infrastructure/api-registry/CompaniesRegistryClient'
import { MetricNames, Directions } from '../../infrastructure/metrics/consts'
import { metric } from '../../infrastructure/metrics/metrics'
import { TYPES } from '../../inversify/types'
import { SendDocumentsMessage } from '../../service-layer/request/document'
import { forEachAsyncParallel } from '../../utils'
import { ErrorName } from '../../utils/ErrorName'
import { EVENT_NAME, TASK_TYPE, FEEDBACK_STATUS } from '../messaging/enums'
import { DocumentMessageData } from '../messaging/messages/DocumentMessageData'
import { RequestClient } from '../messaging/RequestClient'
import { documentRequestContext } from '../tasks/context-utils'
import { TaskClient } from '../tasks/TaskClient'

import { ISendDocuments } from './entities/ISendDocuments'
import { IncomingRequestService } from './IncomingRequestService'

const documentShared = metric(MetricNames.DocumentShared)

@injectable()
export class SendDocumentsService {
  private readonly logger = getLogger('SendDocumentsService')

  constructor(
    @inject(TYPES.RequestClient) private readonly requestClient: RequestClient,
    @inject(TYPES.CompaniesRegistryClient) private readonly companiesRegistryClient: CompaniesRegistryClient,
    @inject(TYPES.DocumentDataAgent) private readonly documentDataAgent: DocumentDataAgent,
    @inject(TYPES.IncomingRequestDataAgent) private readonly incomingRequestDataAgent: IncomingRequestDataAgent,
    @inject(TYPES.TaskClient) private readonly taskClient: TaskClient,
    @inject(TYPES.ServiceUtils) private readonly serviceUtils,
    @inject(TYPES.SharedDocumentsDataAgent) private readonly sharedDocumentDataAgent: SharedDocumentsDataAgent,
    @inject(TYPES.IncomingRequestService) private readonly incomingRequestService: IncomingRequestService
  ) {}

  public async sendDocuments(
    productId: string,
    sendDocuments: ISendDocuments,
    sharedDate: Date = new Date()
  ): Promise<IDocument[]> {
    if (sendDocuments.documents.length === 0) {
      throw new InvalidItem('Should provide at least one document to share')
    }

    await this.validateIncomingRequest(productId, sendDocuments.requestId)

    const documentsToShare: IDocument[] = await this.getDocumentsToShare(productId, sendDocuments)

    // Checking if all documents are registered before sharing them
    this.validateDocumentsRegistered(documentsToShare)

    const shareDocuments = await this.saveSharedDocument(productId, sendDocuments, documentsToShare)

    await this.sendDocumentsMessage(productId, shareDocuments.id, sendDocuments, documentsToShare)

    await this.markDocumentsAsShared(productId, sendDocuments, documentsToShare, sharedDate)

    await this.handleDocumentRequest(productId, sendDocuments)

    documentShared.record(Directions.Outbound)

    return documentsToShare
  }

  private async handleDocumentRequest(productId: string, sendDocuments: ISendDocuments) {
    if (!sendDocuments.requestId) {
      // skip this step if we're sending a document NOT in a document request flow
      return
    }

    this.logger.info('Handling document request', { requestId: sendDocuments.requestId })

    const incomingRequest: IIncomingRequest = await this.incomingRequestService.getBareById(
      productId,
      sendDocuments.requestId
    )
    if (!incomingRequest) {
      throw ErrorUtils.unprocessableEntityException(
        ErrorCode.ValidationHttpContent,
        `Incoming request not found for productId ${productId} and requestId ${sendDocuments.requestId}`
      )
    }

    this.logger.info('Bare incoming request retrieved', incomingRequest)

    // Send note if specified
    this.logger.info(`Sending the following note (it could be empty): ${sendDocuments.note}`)
    if (sendDocuments.note) {
      const { requestId, note } = sendDocuments
      this.logger.info(`Sending the note with this requestId: ${requestId} ${JSON.stringify(note)}`)
      await this.incomingRequestService.sendNote(productId, incomingRequest, note)
    }

    // Send messages for any dismissed types for the request
    if (incomingRequest.dismissedTypes && incomingRequest.dismissedTypes.length === 0) {
      this.logger.info(`There are dismissed types to send for requestId ${sendDocuments.requestId}`, {
        dismissedTypes: incomingRequest.dismissedTypes
      })
      await this.incomingRequestService.sendDismissedType(productId, incomingRequest)
    }

    // 1) Keep track of Document Request progress

    // 1.1) record document type of sent documents in this document request flow
    // 1.2) record document id of sent documents in this document request flow
    const documentRequest = await this.markDocumentsAsSent(productId, sendDocuments.requestId, sendDocuments)

    // 2) Handle Task associated to this Document Request

    // 2.1) determine how many document types have been sent so far
    const sentDocumentTypes = documentRequest.types.filter(
      requestedType => documentRequest.sentDocumentTypes.indexOf(requestedType) !== -1
    )
    const sentDocuments = documentRequest.sentDocuments
    const requestedDocumentTypes = documentRequest.types
    this.logger.info('Document Request details', {
      requestId: sendDocuments.requestId,
      requestedTypes: requestedDocumentTypes,
      requestedTypesLength: requestedDocumentTypes.length,
      sentDocumentTypes,
      sentDocumentTypesLength: sentDocumentTypes.length,
      sentDocuments,
      sentDocumentsLength: sentDocuments.length
    })

    // Compare documents requested vs documents already sent. two possible outcomes:
    // 2.2) close document request task IF all requested documents have been sent
    // 2.3) update document request task IF there are documents left to send
    if (requestedDocumentTypes.length === sentDocumentTypes.length) {
      const counterpartyName = await this.companiesRegistryClient.getCompanyNameByStaticId(documentRequest.companyId)
      await this.closeDocumentRequestTask(sendDocuments.requestId, requestedDocumentTypes.length, counterpartyName)
    } else {
      await this.updateDocumentRequestTask(
        sendDocuments.requestId,
        sentDocumentTypes.length,
        requestedDocumentTypes.length
      )
    }
  }

  private async markDocumentsAsSent(
    productId: string,
    requestId: string,
    sendDocuments: ISendDocuments
  ): Promise<IIncomingRequest> {
    const sentDocumentTypesPromises = sendDocuments.documents.map(
      documentId =>
        new Promise(async resolve => {
          const bareDocument = await this.documentDataAgent.getBareById(productId, documentId)
          resolve(bareDocument.typeId)
        })
    )
    const sentDocumentTypes = await Promise.all(sentDocumentTypesPromises)
    const sentDocuments = sendDocuments.documents
    return this.incomingRequestDataAgent.findAndUpdate(productId, requestId, {
      $addToSet: { sentDocumentTypes, sentDocuments }
    })
  }

  /**
   *
   * @param documentsToShare documents to validate
   * @throws InvalidItem if any document is not registered
   */
  private validateDocumentsRegistered(documentsToShare: IDocument[]) {
    const errDocNames: string[] = []
    documentsToShare.forEach(doc => {
      // Temporarily allow to share LC documents
      if (doc.productId === 'tradeFinance') return

      const isRegistered = doc.state === DocumentState.Registered
      if (!isRegistered) {
        errDocNames.push(doc.name)
      }
    })

    if (errDocNames.length > 0) {
      const docNamesCommaSeparated: string = errDocNames.join(', ')
      throw ErrorUtils.badRequestException(
        ErrorCode.ValidationHttpContent,
        `The documents ${docNamesCommaSeparated} are not yet registered`,
        {}
      )
    }
  }

  private async validateIncomingRequest(productId: string, requestId: string): Promise<void> {
    if (!requestId) return

    const request = await this.incomingRequestService.getBareById(productId, requestId)
    if (!request) throw new ItemNotFound(`Request ${requestId} was not found`)
  }

  private async sendDocumentsMessage(
    productId: string,
    shareId: string,
    sendDocuments: ISendDocuments,
    newDocumentToShare: IDocument[]
  ): Promise<void> {
    this.logger.info(
      'Creating a message with %d document(s) to send to %s',
      newDocumentToShare.length,
      sendDocuments.companyId
    )
    const message: SendDocumentsMessage = await this.convertToMessage(
      productId,
      sendDocuments.requestId,
      shareId,
      sendDocuments.context,
      newDocumentToShare,
      sendDocuments.reviewNotRequired,
      sendDocuments.documentShareNotification
    )

    await this.requestClient.sendDocuments(sendDocuments.companyId, message)
  }

  private async getDocumentsToShare(productId: string, sendDocuments: ISendDocuments): Promise<IDocument[]> {
    const documents: IDocument[] = await Promise.all(
      sendDocuments.documents.map(async documentId => {
        const document = await this.documentDataAgent.getBareById(productId, documentId)

        if (!document) {
          this.logger.error(ErrorCode.DatabaseMissingData, ErrorName.DocumentNotFoundError, 'Document not found', {
            documentId
          })
          throw new ItemNotFound(`Document ${documentId} was not found`)
        }

        if (!this.validateDocumentContext(document, sendDocuments.context)) {
          this.logger.error(
            ErrorCode.DatabaseInvalidData,
            ErrorName.DocumentContextNotValidError,
            'Document has a different context',
            { documentId, expectedContext: sendDocuments.context }
          )
          throw new InvalidItem(`Document ${documentId} not valid in context`)
        }

        if (document.sharedWith.find(shared => shared.counterpartyId === sendDocuments.companyId)) {
          this.logger.warn(
            ErrorCode.UnexpectedError,
            ErrorName.DocumentAlreadyShared,
            'Document has already been shared with counterparty',
            {
              documentId,
              counterparty: sendDocuments.companyId
            }
          )
        }

        this.logger.info('Sending document %s to another node', documentId)
        return document
      })
    )

    // Throwing exception if document size is greater than needed
    await this.serviceUtils.checkDocumentsSize(documents)

    return documents
  }

  private validateDocumentContext(document: IDocument, context: object) {
    if (!document.context || isEqual(document.context, {})) {
      return true
    }
    if (!context || isEqual(context, {})) {
      return true
    }
    // Remove specific action properties from context. TODO: those should be moved out of context to a new "options" object sent alog action
    return isMatch({ ...document.context, reviewNotRequired: undefined }, { ...context, reviewNotRequired: undefined })
  }

  private async markDocumentsAsShared(
    productId: string,
    sendDocuments: ISendDocuments,
    newDocumentsToShare: IDocument[],
    sharedDate: Date = new Date()
  ): Promise<void> {
    await forEachAsyncParallel(newDocumentsToShare, async (document: IDocument) => {
      this.logger.info('Sharing document %s with company %s', document.id, sendDocuments.companyId)
      const docInDB: IFullDocument = await this.documentDataAgent.getById(document.productId, document.id)
      docInDB.sharedWith.push({ counterpartyId: sendDocuments.companyId, sharedDates: [sharedDate] })
      const updatedDocs = await this.documentDataAgent.shareDocumentsWithNewCounterparty(
        sendDocuments.companyId,
        productId,
        document.id,
        {
          $addToSet: { sharedWith: docInDB.sharedWith }
        }
      )
      if (!updatedDocs) {
        /* The counterparty we are sharing with doesnt exist in the sharedWith array
        yet, so the date was not added */
        const positionInArray = docInDB.sharedWith.findIndex(
          shared => shared.counterpartyId === sendDocuments.companyId
        )
        await this.documentDataAgent.findAndUpdate(productId, document.id, {
          $addToSet: { ['sharedWith.' + positionInArray + '.sharedDates']: sharedDate }
        })
      }
      document.sharedWith = docInDB.sharedWith
      this.logger.info('Added permissions for company %s for document %s', sendDocuments.companyId, document.id)
    })
  }

  private async convertToMessage(
    productId: string,
    requestId: string,
    shareId: string,
    context: object,
    documents: IDocument[],
    reviewNotRequiredInput: boolean,
    documentShareNotificationInput: boolean
  ): Promise<SendDocumentsMessage> {
    const documentMessageData: DocumentMessageData[] = await this.serviceUtils.convertDocumentToMessages(
      documents,
      this.documentDataAgent
    )
    return {
      version: 1,
      messageType: EVENT_NAME.SendDocuments,
      context: {
        productId,
        requestId: requestId || null
      },
      data: {
        context,
        shareId: shareId || null,
        documents: documentMessageData,
        reviewNotRequired: reviewNotRequiredInput,
        documentShareNotification: documentShareNotificationInput
      }
    }
  }

  private async saveSharedDocument(productId: string, sendDocuments: ISendDocuments, documents: IDocument[]) {
    const sharedDocuments = this.convertToSharedDocuments(productId, sendDocuments, documents)
    return this.sharedDocumentDataAgent.create(productId, sharedDocuments)
  }

  private convertToSharedDocuments(
    productId: string,
    sendDocuments: ISendDocuments,
    documents: IDocument[]
  ): ISharedDocuments {
    const sharedDocuments = {
      context: sendDocuments.context,
      companyId: sendDocuments.companyId,
      productId,
      documents: this.convertToDocumentFeedback(documents),
      requestId: sendDocuments.requestId,
      feedbackReceived: false
    }
    return sharedDocuments as ISharedDocuments
  }

  private convertToDocumentFeedback(documents: IDocument[]): IDocumentFeedback[] {
    return documents.map(document => ({
      documentId: document.id,
      status: FEEDBACK_STATUS.Pending,
      note: '',
      newVersionRequested: false
    }))
  }

  private async updateDocumentRequestTask(
    requestId: string,
    typesAlreadySent: number,
    totalTypesSent: number
  ): Promise<void> {
    if (!requestId) return

    this.logger.info('Updating task for document request %s', requestId)
    const summary = `Complete document request: ${typesAlreadySent}/${totalTypesSent}`
    const updateTaskRequest: ITaskUpdateStatusRequest = {
      status: TaskStatus.InProgress,
      taskType: TASK_TYPE.DocumentRequest,
      context: documentRequestContext(requestId),
      summary
    }

    await this.taskClient.updateTaskStatus(updateTaskRequest)
  }

  private async closeDocumentRequestTask(
    requestId: string,
    typesAlreadySent: number,
    counterparty: string
  ): Promise<void> {
    if (!requestId) return

    this.logger.info('Closing task for document request %s', requestId)
    const summary = `${typesAlreadySent} document(s) requested from ${counterparty}`
    const updateTaskRequest: ITaskUpdateStatusRequest = {
      status: TaskStatus.Done,
      taskType: TASK_TYPE.DocumentRequest,
      context: documentRequestContext(requestId),
      summary,
      comment: this.createTaskComment(typesAlreadySent),
      outcome: true
    }

    await this.taskClient.updateTaskStatus(updateTaskRequest)
  }

  private createTaskComment(documentsAlreadySent: number): string {
    return `Sent ${documentsAlreadySent} documents to a counterparty`
  }
}
