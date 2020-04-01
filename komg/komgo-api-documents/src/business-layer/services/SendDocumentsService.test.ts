import 'jest'
import 'reflect-metadata'

import { ErrorCode } from '@komgo/error-utilities'
import { ErrorUtils, HttpException } from '@komgo/microservice-config'
import { TaskStatus } from '@komgo/notification-publisher'

import DocumentDataAgent from '../../data-layer/data-agents/DocumentDataAgent'
import InvalidItem from '../../data-layer/data-agents/exceptions/InvalidItem'
import ItemNotFound from '../../data-layer/data-agents/exceptions/ItemNotFound'
import IncomingRequestDataAgent from '../../data-layer/data-agents/IncomingRequestDataAgent'
import SharedDocumentsDataAgent from '../../data-layer/data-agents/SharedDocumentsDataAgent'
import { DocumentState } from '../../data-layer/models/ActionStates'
import { IDocument } from '../../data-layer/models/document'
import {
  COMPANY_ID,
  context,
  document,
  DOCUMENT_ID,
  DOCUMENT_ID1,
  DOCUMENT_ID2,
  DOCUMENT_NAME,
  documentFeedback,
  FILE_ID,
  incomingRequest,
  PRODUCT_ID,
  REQUEST_ID,
  SHARE_ID,
  incomingRequestComplete,
  incomingRequestInProgress
} from '../../data-layer/models/test-entities'
import { CompaniesRegistryClient } from '../../infrastructure/api-registry/CompaniesRegistryClient'
import { mock } from '../../mock-utils'
import { bufferToStream } from '../../utils'
import { TASK_TYPE } from '../messaging/enums'
import { CONTENT_TYPE, FILE_DATA, sendDocumentsMessage } from '../messaging/messages/test-messages'
import { RequestClient } from '../messaging/RequestClient'
import { TaskClient } from '../tasks/TaskClient'

import { ISendDocuments } from './entities/ISendDocuments'
import { IncomingRequestService } from './IncomingRequestService'
import { SendDocumentsService } from './SendDocumentsService'
import ServiceUtils from './ServiceUtils'

const sharedDocumentsSizeLimit = 100

const companyRegistryClient = mock(CompaniesRegistryClient)
const requestClient = mock(RequestClient)
const documentDataAgent = mock(DocumentDataAgent)
const incomingRequestDataAgent = mock(IncomingRequestDataAgent)
const taskClient = mock(TaskClient)
const sharedDocumentsDataAgent = mock(SharedDocumentsDataAgent)
const serviceUtils = mock(ServiceUtils)
const incomingRequestService = mock(IncomingRequestService)

const sendDocuments: ISendDocuments = {
  companyId: COMPANY_ID,
  documents: [DOCUMENT_ID],
  requestId: REQUEST_ID
}

function alreadySharedDocument(date?: Date) {
  const sharedDocument = document()
  sharedDocument.sharedWith = [{ counterpartyId: COMPANY_ID, sharedDates: date ? [date] : [] }]
  sharedDocument.state = DocumentState.Registered
  return sharedDocument
}

describe('SendDocumentsService', () => {
  let service
  const date = new Date()

  beforeEach(() => {
    jest.resetAllMocks()

    requestClient.sendDocuments.mockReset()
    taskClient.updateTaskStatus.mockReset()
    serviceUtils.checkDocumentsSize.mockReset()

    service = new SendDocumentsService(
      requestClient,
      companyRegistryClient,
      documentDataAgent,
      incomingRequestDataAgent,
      taskClient,
      serviceUtils,
      sharedDocumentsDataAgent,
      incomingRequestService
    )

    const documentRegistered = document()
    documentRegistered.state = DocumentState.Registered

    companyRegistryClient.getCompanyNameByStaticId.mockReturnValue('companyName')
    incomingRequestDataAgent.findAndUpdate.mockReturnValue(incomingRequest())
    incomingRequestService.getBareById.mockReturnValue(incomingRequest())
    documentDataAgent.getById.mockReturnValue(document())
    documentDataAgent.getBareById.mockReturnValue(documentRegistered)
    sharedDocumentsDataAgent.create.mockReturnValue({ id: SHARE_ID })
    serviceUtils.convertDocumentToMessages.mockResolvedValue(sendDocumentsMessage().data.documents)
  })

  it('sends a message with documents', async () => {
    await service.sendDocuments(PRODUCT_ID, sendDocuments)

    expect(documentDataAgent.getBareById).toBeCalledWith(PRODUCT_ID, DOCUMENT_ID)
    expect(requestClient.sendDocuments).toBeCalledWith(COMPANY_ID, sendDocumentsMessage())
    expect(sharedDocumentsDataAgent.create).toBeCalledWith(PRODUCT_ID, {
      productId: PRODUCT_ID,
      companyId: COMPANY_ID,
      requestId: REQUEST_ID,
      documents: [documentFeedback()],
      feedbackReceived: false
    })
  })

  it('sends a message with documents and context', async () => {
    const sendContext: any = context()

    const sendWithContext: ISendDocuments = {
      companyId: COMPANY_ID,
      documents: [DOCUMENT_ID],
      requestId: REQUEST_ID,
      context: sendContext
    }
    const documentMessage = sendDocumentsMessage()
    documentMessage.data.context = sendContext

    await service.sendDocuments(PRODUCT_ID, sendWithContext)
    expect(documentDataAgent.getBareById).toBeCalledWith(PRODUCT_ID, DOCUMENT_ID)
    expect(requestClient.sendDocuments).toBeCalledWith(COMPANY_ID, documentMessage)
    expect(sharedDocumentsDataAgent.create).toBeCalledWith(PRODUCT_ID, {
      context: sendContext,
      productId: PRODUCT_ID,
      companyId: COMPANY_ID,
      requestId: REQUEST_ID,
      documents: [documentFeedback()],
      feedbackReceived: false
    })
  })

  it('sends a message in context with extended document context', async () => {
    const sendContext = context()
    const sendWithContext: ISendDocuments = {
      companyId: COMPANY_ID,
      documents: [DOCUMENT_ID],
      requestId: REQUEST_ID,
      context: sendContext
    }
    const extendedDocument = document()
    extendedDocument.state = DocumentState.Registered
    extendedDocument.context = { additionalContextId: 'additional-context-id', ...sendContext }
    documentDataAgent.getBareById.mockReturnValue(extendedDocument)

    const documentMessage = sendDocumentsMessage()
    documentMessage.data.context = sendContext
    documentMessage.data.documents[0].context = extendedDocument.context

    serviceUtils.convertDocumentToMessages.mockResolvedValue(documentMessage.data.documents)

    await service.sendDocuments(PRODUCT_ID, sendWithContext)
    expect(documentDataAgent.getBareById).toBeCalledWith(PRODUCT_ID, DOCUMENT_ID)
    expect(requestClient.sendDocuments).toBeCalledWith(COMPANY_ID, documentMessage)
  })

  it('does not sends message if context missmatch', async () => {
    const sendWithContext: ISendDocuments = {
      companyId: COMPANY_ID,
      documents: [DOCUMENT_ID],
      requestId: REQUEST_ID,
      context: {
        subProductId: 'product-id-missmatch'
      }
    }

    await expect(service.sendDocuments(PRODUCT_ID, sendWithContext)).rejects.toThrow(InvalidItem)
  })

  it('should send message if the saved document context is undefined', async () => {
    const sendWithContext: ISendDocuments = {
      companyId: COMPANY_ID,
      documents: [DOCUMENT_ID],
      requestId: REQUEST_ID,
      context: { ...context() },
      reviewNotRequired: true
    }
    const savedDocument = document()
    savedDocument.state = DocumentState.Registered
    savedDocument.context = undefined
    documentDataAgent.getBareById.mockReturnValue(savedDocument)

    // Should not throw an error
    await service.sendDocuments(PRODUCT_ID, sendWithContext)
  })

  it('sends a message with documents and context even if reviewNotRequired was not saved in document context', async () => {
    const savedContext = { ...context() }
    const savedDocument = document()
    savedDocument.state = DocumentState.Registered
    savedDocument.context = savedContext
    documentDataAgent.getBareById.mockReturnValue(savedDocument)
    const sendContext: any = { ...savedDocument.context, reviewNotRequired: true }

    const sendWithContext: ISendDocuments = {
      companyId: COMPANY_ID,
      documents: [DOCUMENT_ID],
      requestId: REQUEST_ID,
      context: sendContext,
      reviewNotRequired: true
    }

    await service.sendDocuments(PRODUCT_ID, sendWithContext)

    expect(documentDataAgent.getBareById).toBeCalledWith(PRODUCT_ID, DOCUMENT_ID)
    expect(sharedDocumentsDataAgent.create).toBeCalledWith(PRODUCT_ID, {
      context: sendContext,
      productId: PRODUCT_ID,
      companyId: COMPANY_ID,
      requestId: REQUEST_ID,
      documents: [documentFeedback()],
      feedbackReceived: false
    })
  })

  it('does not send a message if there are no documents to share', async () => {
    const noDocumentsToShare: ISendDocuments = {
      companyId: COMPANY_ID,
      documents: [],
      requestId: REQUEST_ID
    }

    const call = service.sendDocuments(PRODUCT_ID, noDocumentsToShare)
    await expect(call).rejects.toThrow(new InvalidItem('Should provide at least one document to share'))
  })

  it('returns shared documents', async () => {
    const sentDocuments: IDocument[] = await service.sendDocuments(PRODUCT_ID, sendDocuments, date)

    expect(sentDocuments).toEqual([alreadySharedDocument(date)])
  })

  it('throws an error if a document is not found', async () => {
    documentDataAgent.getBareById.mockReturnValue(null)

    const call = service.sendDocuments(PRODUCT_ID, sendDocuments)

    const expectedError = new ItemNotFound(`Document ${DOCUMENT_ID} was not found`)
    await expect(call).rejects.toEqual(expectedError)
  })

  it('throws an error if an incoming request is not found', async () => {
    incomingRequestService.getBareById.mockReturnValue(undefined)

    const call = service.sendDocuments(PRODUCT_ID, sendDocuments)

    const expectedError = new ItemNotFound(`Request ${REQUEST_ID} was not found`)
    await expect(call).rejects.toEqual(expectedError)
  })

  it('can share ad-hocs documents if request id is null', async () => {
    incomingRequestService.getBareById.mockReturnValue(undefined)

    const adHocSendDocuments: ISendDocuments = {
      companyId: COMPANY_ID,
      documents: [DOCUMENT_ID],
      requestId: null
    }

    await service.sendDocuments(PRODUCT_ID, adHocSendDocuments)

    const expectedMessage = sendDocumentsMessage()
    expectedMessage.context.requestId = null
    expectedMessage.data.context = undefined

    expect(documentDataAgent.getBareById).toBeCalledWith(PRODUCT_ID, DOCUMENT_ID)
    expect(requestClient.sendDocuments).toBeCalledWith(COMPANY_ID, expectedMessage)
  })

  it('can share ad-hocs documents if request id is undefined', async () => {
    const adHocSendDocuments: ISendDocuments = {
      companyId: COMPANY_ID,
      documents: [DOCUMENT_ID],
      requestId: undefined
    }

    await service.sendDocuments(PRODUCT_ID, adHocSendDocuments)

    const expectedMessage = sendDocumentsMessage()
    expectedMessage.context.requestId = null
    expectedMessage.data.context = undefined

    expect(documentDataAgent.getBareById).toBeCalledWith(PRODUCT_ID, DOCUMENT_ID)
    expect(requestClient.sendDocuments).toBeCalledWith(COMPANY_ID, expectedMessage)
  })

  it('Move task to IN PROGRESS for a document request', async () => {
    incomingRequestDataAgent.findAndUpdate.mockReturnValue(incomingRequestInProgress())
    await service.sendDocuments(PRODUCT_ID, sendDocuments)

    expect(taskClient.updateTaskStatus).toBeCalledWith({
      status: TaskStatus.InProgress,
      taskType: TASK_TYPE.DocumentRequest,
      context: {
        requestId: REQUEST_ID
      },
      summary: 'Complete document request: 1/2'
    })
  })

  it('Move task to DONE for a document request', async () => {
    incomingRequestDataAgent.findAndUpdate.mockReturnValue(incomingRequestComplete())
    await service.sendDocuments(PRODUCT_ID, sendDocuments)

    expect(taskClient.updateTaskStatus).toBeCalledWith({
      status: TaskStatus.Done,
      taskType: TASK_TYPE.DocumentRequest,
      context: {
        requestId: REQUEST_ID
      },
      summary: '2 document(s) requested from companyName',
      comment: 'Sent 2 documents to a counterparty',
      outcome: true
    })
  })

  it('does not close a task for ad-hoc documents sharing', async () => {
    const adHocSendDocuments: ISendDocuments = {
      companyId: COMPANY_ID,
      documents: [DOCUMENT_ID],
      requestId: undefined
    }

    await service.sendDocuments(PRODUCT_ID, adHocSendDocuments)

    expect(taskClient.updateTaskStatus).not.toBeCalled()
  })

  it('expect failure when trying to send a set of documents in which its aggregated size is higher that limit', async () => {
    const adHocSendDocuments: ISendDocuments = {
      companyId: COMPANY_ID,
      documents: [DOCUMENT_ID, DOCUMENT_ID1, DOCUMENT_ID2],
      requestId: undefined
    }

    const expectedTotalSize = adHocSendDocuments.documents.length * sharedDocumentsSizeLimit

    const expectedError = ErrorUtils.requestEntityTooLargeException(
      ErrorCode.ValidationHttpContent,
      `Total files size ${expectedTotalSize} exceeded limit ${sharedDocumentsSizeLimit}`
    )

    serviceUtils.checkDocumentsSize.mockRejectedValue(expectedError)

    let errorToExpect
    try {
      await service.sendDocuments(PRODUCT_ID, adHocSendDocuments)
    } catch (error) {
      errorToExpect = error
    } finally {
      expect(errorToExpect).toMatchObject(expectedError)
    }
  })

  it('updates "sharedWith" information for a shared document NON shared before', async () => {
    await service.sendDocuments(PRODUCT_ID, sendDocuments, date)

    expect(documentDataAgent.findAndUpdate).toBeCalledWith(PRODUCT_ID, DOCUMENT_ID, {
      $addToSet: { 'sharedWith.0.sharedDates': date }
    })
  })

  it('updates "sharedWith" information for a shared document already SHARED before', async () => {
    documentDataAgent.getById.mockReturnValue(alreadySharedDocument())
    documentDataAgent.getBareById.mockReturnValue(alreadySharedDocument())
    await service.sendDocuments(PRODUCT_ID, sendDocuments, date)
  })

  it('fails if any of the documents selected are not registered', async () => {
    const adHocSendDocuments: ISendDocuments = {
      companyId: COMPANY_ID,
      documents: [DOCUMENT_ID],
      requestId: undefined
    }

    const extendedDocument = document()
    extendedDocument.state = DocumentState.Failed
    documentDataAgent.getBareById.mockReturnValue(extendedDocument)

    const expectedError = ErrorUtils.badRequestException(
      ErrorCode.ValidationHttpContent,
      `The documents ${DOCUMENT_NAME} are not yet registered`,
      {}
    )

    let errorToExpect
    try {
      await service.sendDocuments(PRODUCT_ID, adHocSendDocuments)
    } catch (error) {
      errorToExpect = error
    } finally {
      expect(errorToExpect).toMatchObject(expectedError)
    }
  })

  it('temporary fix - does not fail if unregistered trade finance documents are not registered', async () => {
    const adHocSendDocuments: ISendDocuments = {
      companyId: COMPANY_ID,
      documents: [DOCUMENT_ID],
      requestId: undefined
    }

    const extendedDocument = document()
    extendedDocument.state = DocumentState.Failed
    extendedDocument.productId = 'tradeFinance'
    documentDataAgent.getBareById.mockReturnValue(extendedDocument)

    // Should not throw an error
    await service.sendDocuments(PRODUCT_ID, adHocSendDocuments)
  })
})
