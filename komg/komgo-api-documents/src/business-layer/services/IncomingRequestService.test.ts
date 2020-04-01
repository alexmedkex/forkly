import 'reflect-metadata'

import IncomingRequestDataAgent from '../../data-layer/data-agents/IncomingRequestDataAgent'
import {
  IDismissedDocumentType,
  IIncomingRequest,
  IFullIncomingRequest
} from '../../data-layer/models/incoming-request'
import { INote } from '../../data-layer/models/requests/INote'
import {
  incomingRequest,
  fullIncomingRequest,
  PRODUCT_ID,
  REQUEST_ID,
  INCOMING_REQUEST_ID
} from '../../data-layer/models/test-entities'
import { mock } from '../../mock-utils'
import { Note } from '../../service-layer/request/outgoing-request/Note'
import { COMPANY_ID, NOTE_FROM_CONTROLLER } from '../../service-layer/utils/test-entities'
import { EVENT_NAME } from '../messaging/enums'
import { DocumentRequestDismissTypeMessage } from '../messaging/messages/DocumentRequestDismissTypeMessage'
import { NOTE_ORIGIN, DocumentRequestNoteMessage } from '../messaging/messages/DocumentRequestNoteMessage'
import { documentRequestNoteMessage } from '../messaging/messages/test-messages'
import { RequestClient } from '../messaging/RequestClient'

import { IncomingRequestService } from './IncomingRequestService'

const NOTE_RESOLVED: INote = {
  ...NOTE_FROM_CONTROLLER,
  sender: COMPANY_ID
}

const NOTE_TO_DB = {
  $push: { notes: NOTE_RESOLVED }
}

const requestClient = mock(RequestClient)
const incomingRequestDataAgent = mock(IncomingRequestDataAgent)

describe('IncomingRequestService', () => {
  let incomingRequestService

  beforeEach(() => {
    jest.resetAllMocks()
    jest.clearAllMocks()

    incomingRequestDataAgent.getById.mockClear()
    incomingRequestDataAgent.findAndUpdate.mockClear()
    requestClient.sendDocumentRequestNote.mockClear()
    requestClient.sendDocumentRequestDismissType.mockClear()

    incomingRequestService = new IncomingRequestService(COMPANY_ID, requestClient, incomingRequestDataAgent)
  })

  it('get incoming request by id', async () => {
    incomingRequestDataAgent.getById.mockReturnValue(fullIncomingRequest())

    const request = await incomingRequestService.getById(PRODUCT_ID, INCOMING_REQUEST_ID)
    expect(request).toEqual(fullIncomingRequest())
    expect(incomingRequestDataAgent.getById).toBeCalledWith(PRODUCT_ID, INCOMING_REQUEST_ID)
  })

  it('get incoming requests for product', async () => {
    incomingRequestDataAgent.getAllByProduct.mockReturnValue([fullIncomingRequest()])

    const request = await incomingRequestService.getAllByProduct(PRODUCT_ID)
    expect(request).toEqual([fullIncomingRequest()])
    expect(incomingRequestDataAgent.getAllByProduct).toBeCalledWith(PRODUCT_ID)
  })

  it('throw if request not found', async () => {
    incomingRequestDataAgent.getById.mockReturnValue(undefined)

    try {
      await incomingRequestService.sendDismissedType(PRODUCT_ID, REQUEST_ID)
    } catch (e) {
      expect(e).toBeDefined()
    }
  })

  it('send dismiss type', async () => {
    const dismissedType: IDismissedDocumentType = {
      typeId: 'crs',
      content: 'bla bla',
      date: new Date()
    }

    const incomingRequestWithDismissedTypes: IIncomingRequest = {
      ...incomingRequest(),
      dismissedTypes: [dismissedType]
    }

    const dismissalMessage: DocumentRequestDismissTypeMessage = {
      context: {
        productId: PRODUCT_ID
      },
      data: {
        requestId: INCOMING_REQUEST_ID,
        dismissedTypes: incomingRequestWithDismissedTypes.dismissedTypes
      },
      version: 1,
      messageType: EVENT_NAME.RequestDocumentsDismissedTypes
    }

    await incomingRequestService.sendDismissedType(PRODUCT_ID, incomingRequestWithDismissedTypes)
    expect(requestClient.sendDocumentRequestDismissType).toBeCalledWith(COMPANY_ID, dismissalMessage)
  })

  it('send note happy path', async () => {
    const messagedNote: DocumentRequestNoteMessage = documentRequestNoteMessage(
      NOTE_ORIGIN.IncomingRequest,
      NOTE_FROM_CONTROLLER.content
    )

    const messagedNoteWithIncomingReqId = {
      ...messagedNote,
      data: {
        ...messagedNote.data,
        requestId: INCOMING_REQUEST_ID
      }
    }

    await incomingRequestService.sendNote(PRODUCT_ID, fullIncomingRequest(), NOTE_FROM_CONTROLLER)
    expect(incomingRequestDataAgent.findAndUpdate).toBeCalledWith(PRODUCT_ID, INCOMING_REQUEST_ID, NOTE_TO_DB)
    expect(requestClient.sendDocumentRequestNote).toBeCalledWith(COMPANY_ID, messagedNoteWithIncomingReqId)
  })

  it('send note should be ignored if note is already persisted', async () => {
    const incomingRequest = fullIncomingRequest()
    incomingRequest.notes = [NOTE_FROM_CONTROLLER as INote]

    await incomingRequestService.sendNote(PRODUCT_ID, incomingRequest, NOTE_FROM_CONTROLLER)
    expect(incomingRequestDataAgent.findAndUpdate).not.toHaveBeenCalled()
    expect(requestClient.sendDocumentRequestNote).not.toHaveBeenCalled()
  })
})
