import { TaskStatus } from '@komgo/notification-publisher'
import 'reflect-metadata'

import DuplicatedItem from '../../../data-layer/data-agents/exceptions/DuplicatedItem'
import IncomingRequestDataAgent from '../../../data-layer/data-agents/IncomingRequestDataAgent'
import TypeDataAgent from '../../../data-layer/data-agents/TypeDataAgent'
import {
  document,
  CATEGORY_ID,
  COMPANY_ID,
  COMPANY_NAME,
  predefinedType,
  PRODUCT_ID,
  REQUEST_ID,
  TYPE_ID
} from '../../../data-layer/models/test-entities'
import { FieldType } from '../../../FieldTypes'
import { CompaniesRegistryClient } from '../../../infrastructure/api-registry/CompaniesRegistryClient'
import { mock } from '../../../mock-utils'
import { IDocumentRequestTask } from '../../tasks/IDocumentRequestTask'
import { TaskClient } from '../../tasks/TaskClient'
import { EVENT_NAME, TASK_TYPE } from '../enums'
import { DocumentRequestMessage } from '../messages'
import { documentRequestMessage, sendDocumentsMessage } from '../messages/test-messages'

import { DocumentProcessorUtils } from './DocumentProcessorUtils'
import { DocumentRequestProcessor } from './DocumentRequestProcessor'

const docRequestMessage: DocumentRequestMessage = {
  version: 1,
  messageType: EVENT_NAME.RequestDocuments,
  context: {
    productId: PRODUCT_ID
  },
  data: {
    requestId: 'request-id',
    companyId: 'company',
    types: [predefinedType()]
  }
}

const docRequestMessageWithAttachment: DocumentRequestMessage = {
  ...documentRequestMessage(),
  data: {
    ...documentRequestMessage().data,
    forms: sendDocumentsMessage().data.documents
  }
}

const incomingDocumentRequest = {
  id: 'request-id',
  productId: PRODUCT_ID,
  companyId: COMPANY_ID,
  types: [TYPE_ID],
  documents: [],
  sentDocumentTypes: [],
  sentDocuments: []
}

const incomingDocumentRequestWithAttachments = {
  id: 'request-id',
  productId: PRODUCT_ID,
  companyId: COMPANY_ID,
  types: [TYPE_ID],
  documents: [sendDocumentsMessage().data.documents[0].id],
  sentDocumentTypes: [],
  sentDocuments: []
}

const DOCUMENT_REQUEST_TASK: IDocumentRequestTask = {
  summary: `1 document(s) requested from ${COMPANY_NAME}`,
  taskType: TASK_TYPE.DocumentRequest,
  status: TaskStatus.ToDo,
  counterpartyStaticId: COMPANY_ID,
  requiredPermission: {
    productId: PRODUCT_ID,
    actionId: 'manageDocRequest'
  },
  context: {
    requestId: REQUEST_ID
  }
}

const taskClient = mock(TaskClient)
const incomingRequestDataAgent = mock(IncomingRequestDataAgent)
const typeDataAgent = mock(TypeDataAgent)
const companiesRegistryClient = mock(CompaniesRegistryClient)
const documentProcessorUtils = mock(DocumentProcessorUtils)

describe('DocumentRequestProcessor', () => {
  let documentRequestProcessor: DocumentRequestProcessor

  beforeEach(async () => {
    jest.resetAllMocks()

    // TODO: Workaround for: https://github.com/facebook/jest/issues/7083
    taskClient.createTask.mockReset()
    incomingRequestDataAgent.create.mockReset()

    documentRequestProcessor = new DocumentRequestProcessor(
      taskClient,
      typeDataAgent,
      incomingRequestDataAgent,
      companiesRegistryClient,
      documentProcessorUtils
    )

    typeDataAgent.exists.mockReturnValue(true)
    incomingRequestDataAgent.create.mockReturnValue(incomingDocumentRequest)
    companiesRegistryClient.getCompanyNameByStaticId.mockReturnValue(COMPANY_NAME)
  })

  it('subscribes to correct events', () => {
    expect(documentRequestProcessor.eventNames()).toEqual([EVENT_NAME.RequestDocuments])
  })

  it('stores received document request notification', async () => {
    await documentRequestProcessor.processEvent(COMPANY_ID, docRequestMessage)

    expect(incomingRequestDataAgent.create).toBeCalledWith(PRODUCT_ID, incomingDocumentRequest)
  })

  it('does not store a request if receives unknown type with an unknown id', async () => {
    typeDataAgent.exists.mockReturnValue(false)
    expect(typeDataAgent.exists()).toEqual(false)

    await documentRequestProcessor.processEvent(COMPANY_ID, docRequestMessage)

    expect(typeDataAgent.exists).toBeCalledWith(PRODUCT_ID, TYPE_ID)
    expect(taskClient.createTask).not.toHaveBeenCalled()
    expect(incomingRequestDataAgent.create).not.toHaveBeenCalled()
  })

  it('processes a message if some of its entities were stored before', async () => {
    incomingRequestDataAgent.create.mockRejectedValue(new DuplicatedItem('Duplicate item'))

    await documentRequestProcessor.processEvent(COMPANY_ID, docRequestMessage)

    expect(incomingRequestDataAgent.create).toBeCalledWith(PRODUCT_ID, incomingDocumentRequest)
  })

  it('propagate unexpected exception if data access layer fails', async () => {
    const error = new Error('Unknown error')
    incomingRequestDataAgent.create.mockRejectedValue(error)

    const call = documentRequestProcessor.processEvent(COMPANY_ID, docRequestMessage)

    await expect(call).rejects.toThrow(error)
  })

  it('sends document request notification', async () => {
    await documentRequestProcessor.processEvent(COMPANY_ID, docRequestMessage)

    expect(taskClient.createTask).toBeCalledWith(DOCUMENT_REQUEST_TASK, `1 document(s) requested from ${COMPANY_NAME}`)
  })

  it('processes the event correctly when there are attachments', async () => {
    await documentRequestProcessor.processEvent(COMPANY_ID, docRequestMessageWithAttachment)

    expect(incomingRequestDataAgent.create).toBeCalledWith(PRODUCT_ID, incomingDocumentRequestWithAttachments)
  })
})
