import 'reflect-metadata'

import IncomingRequestDataAgent from '../../../data-layer/data-agents/IncomingRequestDataAgent'
import OutgoingRequestDataAgent from '../../../data-layer/data-agents/OutgoingRequestDataAgent'
import { COMPANY_ID, PRODUCT_ID } from '../../../data-layer/models/test-entities'
import { mock } from '../../../mock-utils'
import { EVENT_NAME } from '../enums'
import { DocumentRequestNoteMessage, NOTE_ORIGIN } from '../messages/DocumentRequestNoteMessage'
import { documentRequestNoteMessage } from '../messages/test-messages'

import { DocumentRequestNoteProcessor } from './DocumentRequestNoteProcessor'

const incomingRequestDataAgent = mock(IncomingRequestDataAgent)
const outgoingRequestDataAgent = mock(OutgoingRequestDataAgent)

describe('DocumentRequestNoteProcessor', () => {
  let documentRequestNoteProcessor: DocumentRequestNoteProcessor

  beforeEach(async () => {
    jest.resetAllMocks()

    incomingRequestDataAgent.findAndUpdate.mockReset()
    outgoingRequestDataAgent.findAndUpdate.mockReset()

    documentRequestNoteProcessor = new DocumentRequestNoteProcessor(incomingRequestDataAgent, outgoingRequestDataAgent)
  })

  it('subscribes to correct events', () => {
    expect(documentRequestNoteProcessor.eventNames()).toEqual([EVENT_NAME.RequestDocumentsNote])
  })

  it('stores received note from sender (origin=IncomingRequest)', async () => {
    const noteMessageFromSender: DocumentRequestNoteMessage = documentRequestNoteMessage(
      NOTE_ORIGIN.OutgoingRequest,
      'note content 1'
    )

    await documentRequestNoteProcessor.processEvent(COMPANY_ID, noteMessageFromSender)

    const { requestId, note } = noteMessageFromSender.data
    const update = {
      $push: { notes: note }
    }
    expect(incomingRequestDataAgent.findAndUpdate).toBeCalledWith(PRODUCT_ID, requestId, update)
    expect(incomingRequestDataAgent.findAndUpdate).toHaveBeenCalledTimes(1)
    expect(outgoingRequestDataAgent.findAndUpdate).toHaveBeenCalledTimes(0)
  })

  it('stores received note from receiver (origin=OutgoingRequest)', async () => {
    const noteMessageFromReceiver: DocumentRequestNoteMessage = documentRequestNoteMessage(
      NOTE_ORIGIN.IncomingRequest,
      'note content 2'
    )

    await documentRequestNoteProcessor.processEvent(COMPANY_ID, noteMessageFromReceiver)

    const { requestId, note } = noteMessageFromReceiver.data
    const update = {
      $push: { notes: note }
    }
    expect(outgoingRequestDataAgent.findAndUpdate).toBeCalledWith(PRODUCT_ID, requestId, update)
    expect(outgoingRequestDataAgent.findAndUpdate).toHaveBeenCalledTimes(1)
    expect(incomingRequestDataAgent.findAndUpdate).toHaveBeenCalledTimes(0)
  })
})
