import 'reflect-metadata'

import { TaskStatus } from '@komgo/notification-publisher'

import DocumentMismatch from '../../data-layer/data-agents/exceptions/DocumentMismatch'
import ItemNotFound from '../../data-layer/data-agents/exceptions/ItemNotFound'
import ReceivedDocumentsDataAgent from '../../data-layer/data-agents/ReceivedDocumentsDataAgent'
import {
  documentReview,
  fullReceivedDocuments,
  PRODUCT_ID,
  RECEIVED_DOCUMENTS_ID,
  RECEIVED_DOCUMENTS_ID2,
  receivedDocuments,
  fullReceivedDocumentsWithThreeDocsStatus,
  secondReceivedDocuments,
  secondDocumentReview
} from '../../data-layer/models/test-entities'
import { CompaniesRegistryClient } from '../../infrastructure/api-registry/CompaniesRegistryClient'
import { mock } from '../../mock-utils'
import { DOCUMENT_ID, REQUEST_ID } from '../../service-layer/utils/test-entities'
import { FEEDBACK_STATUS, TASK_TYPE } from '../messaging/enums'
import { documentFeedbackMessage } from '../messaging/messages/test-messages'
import { RequestClient } from '../messaging/RequestClient'
import { TaskClient } from '../tasks/TaskClient'

import { ReceivedDocumentsService } from './ReceivedDocumentsService'

const receivedDocumentsDataAgent = mock(ReceivedDocumentsDataAgent)
const requestClient = mock(RequestClient)
const taskClient = mock(TaskClient)
const companiesRegistryClient = mock(CompaniesRegistryClient)

const FEEDBACK_MESSAGE = documentFeedbackMessage(FEEDBACK_STATUS.Rejected)
const COMPANY_ID = 'company-id'

const documentReviewMismatch = {
  documentId: 'document-id-mismatch',
  status: 'approved',
  note: ''
}

const errorItemNotFound = new ItemNotFound(`No receivedDocuments found for ID ${RECEIVED_DOCUMENTS_ID}`)

const errorDocumentMismatch = new DocumentMismatch(
  `Mismatching id's provided for receivedDocuments ID ${RECEIVED_DOCUMENTS_ID}`
)

describe('ReceivedDocumentsService', () => {
  let receivedDocumentsService

  beforeEach(() => {
    jest.resetAllMocks()

    requestClient.sendDocumentFeedback.mockReset()
    receivedDocumentsDataAgent.update.mockReset()

    receivedDocumentsDataAgent.update.mockResolvedValue(receivedDocuments())
    receivedDocumentsDataAgent.getBareById.mockResolvedValue(receivedDocuments())

    taskClient.updateTaskStatus.mockReset()

    companiesRegistryClient.getCompanyNameByStaticId.mockReset()
    companiesRegistryClient.getCompanyNameByStaticId.mockResolvedValue(COMPANY_ID)

    receivedDocumentsService = new ReceivedDocumentsService(
      receivedDocumentsDataAgent,
      requestClient,
      taskClient,
      companiesRegistryClient
    )
  })

  it('get sharedInfo from a document', async () => {
    receivedDocumentsDataAgent.getAllByDocumentIdDesc.mockResolvedValue([fullReceivedDocuments()])

    const result = await receivedDocumentsService.getSharedInfo(PRODUCT_ID, DOCUMENT_ID)
  })

  it('get recieved documents by id', async () => {
    receivedDocumentsDataAgent.getById.mockReturnValue(fullReceivedDocuments())

    const request = await receivedDocumentsService.getById(PRODUCT_ID, RECEIVED_DOCUMENTS_ID)
    expect(request).toEqual(fullReceivedDocuments())
    expect(receivedDocumentsDataAgent.getById).toBeCalledWith(PRODUCT_ID, RECEIVED_DOCUMENTS_ID)
  })

  it('get bare object received documents by id', async () => {
    receivedDocumentsDataAgent.getBareById.mockReturnValue(receivedDocuments())

    const request = await receivedDocumentsService.getBareById(PRODUCT_ID, RECEIVED_DOCUMENTS_ID)
    expect(request).toEqual(receivedDocuments())
    expect(receivedDocumentsDataAgent.getBareById).toBeCalledWith(PRODUCT_ID, RECEIVED_DOCUMENTS_ID)
  })

  it('get incoming requests for product', async () => {
    receivedDocumentsDataAgent.getAllWithContext.mockReturnValue([fullReceivedDocuments()])

    const request = await receivedDocumentsService.getAllWithContext(PRODUCT_ID)
    expect(request).toEqual([fullReceivedDocuments()])
    expect(receivedDocumentsDataAgent.getAllWithContext).toBeCalledWith(PRODUCT_ID, undefined)
  })

  it('throws an exception when recievedDocumentsId not found', async () => {
    receivedDocumentsDataAgent.getById.mockReturnValue(null)

    const request = receivedDocumentsService.sendFeedback(PRODUCT_ID, RECEIVED_DOCUMENTS_ID)
    await expect(request).rejects.toThrow(errorItemNotFound)
  })

  it('update received documents requests for product', async () => {
    receivedDocumentsDataAgent.getBareById.mockReturnValue(receivedDocuments())

    const request = await receivedDocumentsService.updateDocumentsStatus(PRODUCT_ID, RECEIVED_DOCUMENTS_ID, [
      documentReview()
    ])

    expect(request).toEqual(receivedDocuments())
    // given there's no reviewed documents, ensure task is not updated
    expect(taskClient.updateTaskStatus).not.toBeCalled()
  })

  it('sends a valid feedback message without a request ID', async () => {
    const adhocDocuments = fullReceivedDocuments()
    const adhocFeedbackMessage = FEEDBACK_MESSAGE
    adhocFeedbackMessage.data.requestId = null
    adhocFeedbackMessage.data.shareId = adhocDocuments.shareId
    adhocDocuments.request = null

    receivedDocumentsDataAgent.getById.mockReturnValue(adhocDocuments)

    const request = await receivedDocumentsService.sendFeedback(PRODUCT_ID, RECEIVED_DOCUMENTS_ID)
    expect(request).toEqual(undefined)
    expect(requestClient.sendDocumentFeedback).toBeCalledWith(COMPANY_ID, adhocFeedbackMessage)
    // closes a task associated with received documents
    expect(taskClient.updateTaskStatus).toBeCalledWith({
      status: TaskStatus.Done,
      taskType: TASK_TYPE.DocumentsReview,
      context: {
        receivedDocumentsId: RECEIVED_DOCUMENTS_ID
      },
      summary: '1 document(s) received from company-id',
      comment: '0 documents approved, 1 documents rejected',
      outcome: false
    })
  })

  it('when updating document status, should set task status to IN PROGRESS and the task summary', async () => {
    receivedDocumentsDataAgent.getBareById.mockReturnValue(receivedDocuments())

    receivedDocumentsDataAgent.update.mockResolvedValue(fullReceivedDocumentsWithThreeDocsStatus())
    await receivedDocumentsService.updateDocumentsStatus(PRODUCT_ID, RECEIVED_DOCUMENTS_ID, [documentReview()])

    /**
     * fullReceivedDocumentsWithThreeDocsStatus contains a total of 3 documents:
     * - 1 pending
     * - 1 approved
     * - 1 -rejected
     * The task summary should that count all approved + rejected (2) by all 3 documents
     * The task progress should be updated to 'In Progress'
     */
    expect(taskClient.updateTaskStatus).toBeCalledWith({
      status: TaskStatus.InProgress,
      taskType: TASK_TYPE.DocumentsReview,
      context: {
        receivedDocumentsId: RECEIVED_DOCUMENTS_ID
      },
      summary: 'Complete document review: 2/3'
    })
  })

  it('records feedback status', async () => {
    await receivedDocumentsService.sendFeedback(PRODUCT_ID, RECEIVED_DOCUMENTS_ID)

    expect(receivedDocumentsDataAgent.update).toBeCalledWith(PRODUCT_ID, {
      ...receivedDocuments(),
      feedbackSent: true
    })
  })

  it('update received documents by request id - single element -', async () => {
    const receivedDocumentsArray = [receivedDocuments()]

    receivedDocumentsDataAgent.getAllBareByRequestId.mockReturnValue(receivedDocumentsArray)

    const request = await receivedDocumentsService.updateDocumentsStatusByRequestId(PRODUCT_ID, REQUEST_ID, [
      documentReview()
    ])

    expect(request).toEqual(receivedDocumentsArray)
    // given there's no reviewed documents, ensure task is not updated
    expect(taskClient.updateTaskStatus).not.toBeCalled()
  })

  it('when updating document by request id, should set task status to IN PROGRESS and the task summary', async () => {
    const receivedDocumentsArray = [receivedDocuments()]

    receivedDocumentsDataAgent.getAllBareByRequestId.mockReturnValue(receivedDocumentsArray)

    receivedDocumentsDataAgent.update.mockResolvedValue(fullReceivedDocumentsWithThreeDocsStatus())
    await receivedDocumentsService.updateDocumentsStatusByRequestId(PRODUCT_ID, REQUEST_ID, [documentReview()])

    /**
     * fullReceivedDocumentsWithThreeDocsStatus contains a total of 3 documents:
     * - 1 pending
     * - 1 approved
     * - 1 -rejected
     * The task summary should that count all approved + rejected (2) by all 3 documents
     * The task progress should be updated to 'In Progress'
     */
    expect(taskClient.updateTaskStatus).toBeCalledWith({
      status: TaskStatus.InProgress,
      taskType: TASK_TYPE.DocumentsReview,
      context: {
        receivedDocumentsId: RECEIVED_DOCUMENTS_ID
      },
      summary: 'Complete document review: 2/3'
    })
  })

  it('update received documents by request id - two elements -', async () => {
    receivedDocumentsDataAgent.update
      .mockReturnValueOnce(receivedDocuments())
      .mockReturnValueOnce(secondReceivedDocuments())
    const receivedDocumentsArray = [receivedDocuments(), secondReceivedDocuments()]

    receivedDocumentsDataAgent.getAllBareByRequestId.mockReturnValue(receivedDocumentsArray)

    const request = await receivedDocumentsService.updateDocumentsStatusByRequestId(PRODUCT_ID, REQUEST_ID, [
      documentReview(),
      secondDocumentReview()
    ])

    expect(request).toEqual(receivedDocumentsArray)

    // The document included in secondReceivedDocuments() has been rejected so we update the task
    expect(taskClient.updateTaskStatus).toBeCalledWith({
      status: TaskStatus.InProgress,
      taskType: TASK_TYPE.DocumentsReview,
      context: {
        receivedDocumentsId: RECEIVED_DOCUMENTS_ID2
      },
      summary: 'Complete document review: 1/1'
    })
  })
})
