import { ErrorCode } from '@komgo/error-utilities'
import { ErrorUtils } from '@komgo/microservice-config'
import 'reflect-metadata'
import * as _ from 'lodash'

import DocumentDataAgent from '../../data-layer/data-agents/DocumentDataAgent'
import ItemNotFound from '../../data-layer/data-agents/exceptions/ItemNotFound'
import RequestDataAgent from '../../data-layer/data-agents/OutgoingRequestDataAgent'
import TypeDataAgent from '../../data-layer/data-agents/TypeDataAgent'
import {
  document,
  DOCUMENT_ID,
  fullOutgoingRequest,
  PRODUCT_ID,
  outgoingRequest,
  outgoingRequestWithForms,
  REQUEST_ID,
  type
} from '../../data-layer/models/test-entities'
import { mock } from '../../mock-utils'
import { EVENT_NAME } from '../messaging/enums'
import { DocumentRequestMessage } from '../messaging/messages'
import { sendDocumentsMessage, documentRequestNoteMessage } from '../messaging/messages/test-messages'
import { RequestClient } from '../messaging/RequestClient'

import { RequestService } from './RequestService'
import ServiceUtils from './ServiceUtils'
import { NOTE_ORIGIN } from '../messaging/messages/DocumentRequestNoteMessage'
import { INote } from '../../data-layer/models/requests/INote'
import { Note } from '../../service-layer/request/outgoing-request/Note'
import { NotificationClient } from '../notifications/NotificationClient'
import { CompaniesRegistryClient } from '../../infrastructure/api-registry/CompaniesRegistryClient'

const sharedDocumentsSizeLimit = 100

const COMPANY_ID = 'company-id'
const COMPANY_DOMAIN_ID = 'company.bank2'
const SUBPRODUCT_ID = 'subproduct-id'

const requestMessage: DocumentRequestMessage = {
  version: 1,
  messageType: EVENT_NAME.RequestDocuments,
  context: {
    productId: PRODUCT_ID
  },
  data: {
    requestId: REQUEST_ID,
    companyId: COMPANY_ID,
    types: [_.omit(type(), 'vaktId')]
  }
}

const requestMessageWithForms: DocumentRequestMessage = {
  ...requestMessage,
  data: {
    ...requestMessage.data,
    forms: sendDocumentsMessage().data.documents
  }
}

// notes related
const NOTE_FROM_CONTROLLER: Note = {
  date: new Date(0),
  sender: 'this-will-be-replaced-by-company-id',
  content: 'This is a note'
}

const NOTE_RESOLVED: INote = {
  ...NOTE_FROM_CONTROLLER,
  sender: COMPANY_ID
}

const NOTE_TO_DB = {
  $push: { notes: NOTE_RESOLVED }
}

const typeDataAgent = mock(TypeDataAgent)
const requestDataAgent = mock(RequestDataAgent)
const requestClient = mock(RequestClient)
const documentDataAgent = mock(DocumentDataAgent)
const serviceUtils = mock(ServiceUtils)
const notificationClient = mock(NotificationClient)
const companiesRegistryClient = mock(CompaniesRegistryClient)

describe('RequestService', () => {
  let service

  beforeEach(() => {
    jest.resetAllMocks()
    jest.clearAllMocks()
    requestDataAgent.findAndUpdate.mockClear()
    requestClient.sendDocumentRequestNote.mockClear()

    service = new RequestService(
      COMPANY_ID,
      documentDataAgent,
      requestDataAgent,
      typeDataAgent,
      requestClient,
      serviceUtils,
      companiesRegistryClient,
      notificationClient
    )
    jest.resetAllMocks()

    typeDataAgent.getTypesByIds.mockReturnValue([type()])
    requestDataAgent.getById.mockReturnValue(COMPANY_DOMAIN_ID)
  })

  it('send document request', async () => {
    const request = outgoingRequest()
    requestDataAgent.create.mockReturnValue(request)

    const result = await service.sendDocumentRequest(PRODUCT_ID, request)

    expect(result).toEqual(request)

    expect(requestDataAgent.create).toBeCalledWith(PRODUCT_ID, request)
    expect(requestClient.sendDocumentRequest).toBeCalledWith(COMPANY_ID, requestMessage)
    expect(notificationClient.sendNotification).toBeCalledWith(
      expect.objectContaining({ context: { requestId: request.id } })
    )
  })

  it('send document request with forms', async () => {
    requestDataAgent.create.mockReturnValue(outgoingRequestWithForms())
    documentDataAgent.getBareById.mockResolvedValue(document())

    serviceUtils.convertDocumentToMessages.mockResolvedValue(sendDocumentsMessage().data.documents)

    const result = await service.sendDocumentRequest(PRODUCT_ID, outgoingRequestWithForms())

    expect(requestDataAgent.create).toBeCalledWith(PRODUCT_ID, outgoingRequestWithForms())
    expect(requestClient.sendDocumentRequest).toBeCalledWith(COMPANY_ID, requestMessageWithForms)
    expect(result).toEqual(outgoingRequestWithForms())
  })

  it('send document request with forms with excessive size', async () => {
    requestDataAgent.create.mockReturnValue(outgoingRequestWithForms())
    documentDataAgent.getBareById.mockResolvedValue(document())

    const wrongSize = 2 * sharedDocumentsSizeLimit

    const expectedError = ErrorUtils.requestEntityTooLargeException(
      ErrorCode.ValidationHttpContent,
      `Total files size ${wrongSize} exceeded limit ${sharedDocumentsSizeLimit}`
    )

    serviceUtils.checkDocumentsSize.mockRejectedValue(expectedError)

    let errorToExpect
    try {
      await service.sendDocumentRequest(PRODUCT_ID, outgoingRequestWithForms())
    } catch (error) {
      errorToExpect = error
    } finally {
      expect(requestDataAgent.create).toBeCalledWith(PRODUCT_ID, outgoingRequestWithForms())
      expect(requestClient.sendDocumentRequest).toBeCalledWith(COMPANY_ID, requestMessageWithForms)
      expect(errorToExpect).toMatchObject(expectedError)
    }
  })

  it('sends document request with forms and throws and exception', async () => {
    requestDataAgent.create.mockReturnValue(outgoingRequestWithForms())
    documentDataAgent.getBareById.mockResolvedValue(undefined)

    const expectedError = new ItemNotFound(`Form ${DOCUMENT_ID} was not found`)

    let errorToExpect
    try {
      await service.sendDocumentRequest(PRODUCT_ID, outgoingRequestWithForms())
    } catch (error) {
      errorToExpect = error
    } finally {
      expect(requestDataAgent.create).toBeCalledWith(PRODUCT_ID, outgoingRequestWithForms())
      expect(requestClient.sendDocumentRequest).toBeCalledWith(COMPANY_ID, requestMessageWithForms)
      expect(errorToExpect).toMatchObject(expectedError)
    }
  })

  it('send note happy path', async () => {
    const messagedNote = documentRequestNoteMessage(NOTE_ORIGIN.OutgoingRequest, NOTE_FROM_CONTROLLER.content)

    await service.sendNote(PRODUCT_ID, fullOutgoingRequest(), NOTE_FROM_CONTROLLER)
    expect(requestDataAgent.findAndUpdate).toBeCalledWith(PRODUCT_ID, REQUEST_ID, NOTE_TO_DB)
    expect(requestClient.sendDocumentRequestNote).toBeCalledWith(COMPANY_ID, messagedNote)
  })

  it('send note should be ignored if note is already persisted', async () => {
    const outgoingRequestWithNotes = fullOutgoingRequest()
    outgoingRequestWithNotes.notes = [NOTE_FROM_CONTROLLER as INote]

    await service.sendNote(PRODUCT_ID, outgoingRequestWithNotes, NOTE_FROM_CONTROLLER)
    expect(requestDataAgent.findAndUpdate).not.toHaveBeenCalled()
    expect(requestClient.sendDocumentRequestNote).not.toHaveBeenCalled()
  })
})
