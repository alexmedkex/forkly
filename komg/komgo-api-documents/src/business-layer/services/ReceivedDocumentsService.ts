import { ITaskUpdateStatusRequest, TaskStatus } from '@komgo/notification-publisher'
import { inject, injectable } from 'inversify'

import DocumentMismatch from '../../data-layer/data-agents/exceptions/DocumentMismatch'
import ItemNotFound from '../../data-layer/data-agents/exceptions/ItemNotFound'
import ReceivedDocumentsDataAgent from '../../data-layer/data-agents/ReceivedDocumentsDataAgent'
import {
  IDocumentReview,
  IFullDocumentReview,
  IFullReceivedDocuments,
  IReceivedDocuments
} from '../../data-layer/models/received-documents'
import { CompaniesRegistryClient } from '../../infrastructure/api-registry/CompaniesRegistryClient'
import { Directions, MetricNames } from '../../infrastructure/metrics/consts'
import { metric } from '../../infrastructure/metrics/metrics'
import { TYPES } from '../../inversify/types'
import { ISharedInfo } from '../../service-layer/responses/document/ISharedInfo'
import { isFirstContainedInSecond, forEachAsync } from '../../utils'
import { EVENT_NAME, FEEDBACK_STATUS, TASK_TYPE } from '../messaging/enums'
import { DocumentFeedbackMessage } from '../messaging/messages'
import { DocumentFeedbackData } from '../messaging/messages/DocumentFeedbackData'
import { RequestClient } from '../messaging/RequestClient'
import { receivedDocumentsContext } from '../tasks/context-utils'
import { TaskClient } from '../tasks/TaskClient'

const documentFeedback = metric(MetricNames.DocumentFeedbackSent)

@injectable()
export class ReceivedDocumentsService {
  constructor(
    @inject(TYPES.ReceivedDocumentsDataAgent) private readonly receivedDocumentsDataAgent: ReceivedDocumentsDataAgent,
    @inject(TYPES.RequestClient) private readonly requestClient: RequestClient,
    @inject(TYPES.TaskClient) private readonly taskClient: TaskClient,
    @inject(TYPES.CompaniesRegistryClient) private readonly companiesRegistryClient: CompaniesRegistryClient
  ) {}

  async getById(productId: string, receivedDocumentsId: string): Promise<IFullReceivedDocuments> {
    return this.receivedDocumentsDataAgent.getById(productId, receivedDocumentsId)
  }

  async getBareById(productId: string, receivedDocumentsId: string): Promise<IReceivedDocuments> {
    return this.receivedDocumentsDataAgent.getBareById(productId, receivedDocumentsId)
  }

  async getAllWithContext(productId: string, context?: object): Promise<IFullReceivedDocuments[]> {
    return this.receivedDocumentsDataAgent.getAllWithContext(productId, context)
  }

  /**
   * Returns the shared info of the document which id is passed as parameter. To do
   * that, this function searches through all the collection `received-documents`
   */
  async getSharedInfo(productId: string, documentId: string): Promise<ISharedInfo> {
    const receivedDocs: IFullReceivedDocuments[] = await this.receivedDocumentsDataAgent.getAllByDocumentIdDesc(
      productId,
      documentId
    )

    if (!receivedDocs || receivedDocs.length === 0) {
      // The documentId is not associated to any receivedDocuments process
      throw new ItemNotFound(`No received documents found for ID ${documentId}`)
    }

    const lastReceivedDocs: IFullReceivedDocuments = receivedDocs[0]
    if (!lastReceivedDocs.documents || lastReceivedDocs.documents.length === 0) {
      // The documentId is not associated to any documents amongst the received documents
      throw new ItemNotFound(`No documents found for ID ${documentId}`)
    } else {
      // The documentId is part of one review process
      const fullSharedInfo: IFullDocumentReview = lastReceivedDocs.documents.find(d => d.document.id === documentId)
      return this.convertSharedInfo(fullSharedInfo, lastReceivedDocs.id, lastReceivedDocs.feedbackSent)
    }
  }

  async updateDocumentsStatus(
    productId: string,
    receivedDocumentsId: string,
    documentsReviewed: IDocumentReview[]
  ): Promise<IReceivedDocuments> {
    const receivedDocuments: IReceivedDocuments = await this.getBareById(productId, receivedDocumentsId)
    return this.updateReceivedDocumentsCollection(
      productId,
      receivedDocumentsId,
      documentsReviewed,
      receivedDocuments,
      true
    )
  }

  async updateDocumentsStatusByRequestId(
    productId: string,
    requestId: string,
    documentsReviewed: IDocumentReview[]
  ): Promise<IReceivedDocuments[]> {
    const receivedDocumentsByRequestId: IReceivedDocuments[] = await this.receivedDocumentsDataAgent.getAllBareByRequestId(
      productId,
      requestId
    )
    const updatedReceivedDocuments: IReceivedDocuments[] = []

    await forEachAsync(receivedDocumentsByRequestId, async receivedDocByRequestId => {
      const receivedDocument: IReceivedDocuments = await this.updateReceivedDocumentsCollection(
        productId,
        receivedDocByRequestId.id,
        documentsReviewed,
        receivedDocByRequestId
      )

      updatedReceivedDocuments.push(receivedDocument)
    })

    return updatedReceivedDocuments
  }

  async sendFeedback(productId: string, receivedDocumentsId: string): Promise<void> {
    const receivedDocuments: IFullReceivedDocuments = await this.getById(productId, receivedDocumentsId)
    if (receivedDocuments === null) {
      throw new ItemNotFound(`No receivedDocuments found for ID ${receivedDocumentsId}`)
    }

    await this.sendFeedbackMessage(productId, receivedDocuments)
    await this.closeReceivedDocumentsTask(receivedDocuments)
    await this.markFeedbackSent(productId, receivedDocumentsId)
    documentFeedback.record(Directions.Outbound)
  }

  private isValidDocumentsReview(
    documentsReviewed: IDocumentReview[],
    receivedDocuments: IReceivedDocuments,
    receivedDocumentsId: string
  ): void {
    if (
      !isFirstContainedInSecond(
        documentsReviewed.map(document => document.documentId),
        receivedDocuments.documents.map(document => document.documentId)
      )
    ) {
      throw new DocumentMismatch(`Mismatching id's provided for receivedDocuments ID ${receivedDocumentsId}`)
    }
  }

  private addDocumentReviews(receivedDocuments: IReceivedDocuments, documentsReviewed: IDocumentReview[]) {
    const updatedDocs: IDocumentReview[] = this.updateReceivedDocuments(receivedDocuments.documents, documentsReviewed)
    receivedDocuments.documents = updatedDocs
  }

  private async handleInProgressTask(receivedDocuments: IReceivedDocuments) {
    // move task to 'In Progress' only if there are reviewed documents
    if (this.numberOfReviewedDocuments(receivedDocuments) > 0) {
      await this.progressReceivedDocumentsTask(receivedDocuments)
    }
  }

  private async sendFeedbackMessage(productId: string, receivedDocuments: IFullReceivedDocuments): Promise<void> {
    const feedbackMessage = this.convertReceivedDocumentsToFeedbackMessage(productId, receivedDocuments)
    await this.requestClient.sendDocumentFeedback(receivedDocuments.companyId, feedbackMessage)
  }

  private convertSharedInfo(
    fullSharedInfo: IFullDocumentReview,
    receivedDocumentsId: string,
    completedReview: boolean
  ): ISharedInfo {
    return {
      status: fullSharedInfo.status,
      note: fullSharedInfo.note,
      reviewerId: fullSharedInfo.reviewerId,
      receivedDocumentsId,
      completedReview
    }
  }

  private convertReceivedDocumentsToFeedbackMessage(
    productId: string,
    documents: IFullReceivedDocuments
  ): DocumentFeedbackMessage {
    return {
      version: 1,
      messageType: EVENT_NAME.SendDocumentFeedback,
      context: {
        productId
      },
      data: {
        requestId: documents.request ? documents.request.id : null,
        shareId: documents.shareId || null,
        documents: documents.documents.map(document => this.mapDocumentToFeedback(document))
      }
    }
  }

  private mapDocumentToFeedback(documentReview: IFullDocumentReview): DocumentFeedbackData {
    return {
      id: documentReview.document.id,
      notes: documentReview.note,
      status: documentReview.status,
      newVersionRequested: false
    }
  }

  private async progressReceivedDocumentsTask(receivedDocuments: IReceivedDocuments): Promise<void> {
    const updateTaskRequest: ITaskUpdateStatusRequest = {
      status: TaskStatus.InProgress,
      taskType: TASK_TYPE.DocumentsReview,
      context: receivedDocumentsContext(receivedDocuments),
      summary: this.createInProgressTaskSummary(receivedDocuments)
    }
    await this.taskClient.updateTaskStatus(updateTaskRequest)
  }

  private async closeReceivedDocumentsTask(receivedDocuments: IFullReceivedDocuments): Promise<void> {
    const updateTaskRequest: ITaskUpdateStatusRequest = {
      status: TaskStatus.Done,
      taskType: TASK_TYPE.DocumentsReview,
      context: receivedDocumentsContext(receivedDocuments),
      summary: await this.createCloseTaskSummary(receivedDocuments),
      comment: this.createTaskComment(receivedDocuments),
      outcome: this.isPositiveOutcome(receivedDocuments)
    }
    await this.taskClient.updateTaskStatus(updateTaskRequest)
  }

  private createInProgressTaskSummary(receivedDocuments: IReceivedDocuments): string {
    const numberOfReviewedDocuments = this.numberOfReviewedDocuments(receivedDocuments)
    const numberOfReceivedDocuments = receivedDocuments.documents.length
    return `Complete document review: ${numberOfReviewedDocuments}/${numberOfReceivedDocuments}`
  }

  private async createCloseTaskSummary(receivedDocuments: IFullReceivedDocuments): Promise<string> {
    const companyName = await this.companiesRegistryClient.getCompanyNameByStaticId(receivedDocuments.companyId)
    return `${receivedDocuments.documents.length} document(s) received from ${companyName}`
  }

  private createTaskComment(documents: IFullReceivedDocuments): string {
    const approvedDocumentsNum: number = this.numberOfApprovedDocuments(documents)
    const rejectedDocumentsNum: number = documents.documents.length - approvedDocumentsNum

    return `${approvedDocumentsNum} documents approved, ${rejectedDocumentsNum} documents rejected`
  }

  private numberOfApprovedDocuments(receivedDocuments: IFullReceivedDocuments): number {
    return receivedDocuments.documents.filter(document => document.status === FEEDBACK_STATUS.Accepted).length
  }

  private numberOfReviewedDocuments(receivedDocuments: IReceivedDocuments): number {
    return receivedDocuments.documents.reduce(
      (acc, document) =>
        document.status === FEEDBACK_STATUS.Accepted || document.status === FEEDBACK_STATUS.Rejected ? (acc += 1) : acc,
      0
    )
  }

  private isPositiveOutcome(receivedDocuments: IFullReceivedDocuments): boolean {
    return this.numberOfApprovedDocuments(receivedDocuments) === receivedDocuments.documents.length
  }

  private async markFeedbackSent(productId: string, receivedDocumentsId: string): Promise<void> {
    const receivedDocuments = await this.receivedDocumentsDataAgent.getBareById(productId, receivedDocumentsId)
    receivedDocuments.feedbackSent = true

    await this.receivedDocumentsDataAgent.update(productId, receivedDocuments)
  }

  private updateReceivedDocuments(
    receivedDocuments: IDocumentReview[],
    documentsReviewed: IDocumentReview[]
  ): IDocumentReview[] {
    return receivedDocuments.map(receivedDoc => {
      const documentMatch: IDocumentReview = documentsReviewed.find(
        docReviewed => docReviewed.documentId === receivedDoc.documentId
      )
      if (documentMatch) {
        /* If the status and the note are the same, means that the user that triggered
        this action did not change this value so should not be updated */
        if (documentMatch.status === receivedDoc.status && documentMatch.note === receivedDoc.note) {
          documentMatch.reviewerId = receivedDoc.reviewerId
        }
        return documentMatch
      } else {
        return receivedDoc
      }
    })
  }

  private async updateReceivedDocumentsCollection(
    productId: string,
    receivedDocumentsId: string,
    documentsReviewed: IDocumentReview[],
    receivedDocuments: IReceivedDocuments,
    isNotByRequestId?: boolean
  ): Promise<IReceivedDocuments> {
    if (isNotByRequestId) {
      this.isValidDocumentsReview(documentsReviewed, receivedDocuments, receivedDocumentsId)
    }

    this.addDocumentReviews(receivedDocuments, documentsReviewed)

    // update received documents with documentsReviewed
    const updatedReceivedDocuments: IReceivedDocuments = await this.receivedDocumentsDataAgent.update(
      productId,
      receivedDocuments
    )

    await this.handleInProgressTask(updatedReceivedDocuments)
    return updatedReceivedDocuments
  }
}
