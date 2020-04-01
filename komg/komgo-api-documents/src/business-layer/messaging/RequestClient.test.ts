import 'reflect-metadata'

import { mock } from '../../mock-utils'
import {
  documentFeedbackMessage,
  documentRequestMessage,
  sendDocumentsMessage,
  documentRequestDismissTypeMessage,
  documentRequestNoteMessage
} from '../messaging/messages/test-messages'

import { EVENT_NAME } from './enums'
import MessagingError from './MessagingError'
import { RabbitMQPublishingClient } from './RabbitMQPublishingClient'
import { RequestClient } from './RequestClient'
import { NOTE_ORIGIN } from './messages/DocumentRequestNoteMessage'

const COMPANY_ID = 'company'

describe('RequestClient', () => {
  let publishingClient

  let requestClient

  beforeEach(() => {
    jest.resetAllMocks()

    publishingClient = mock(RabbitMQPublishingClient)
    requestClient = new RequestClient(publishingClient)
  })

  it('send document request', async () => {
    await requestClient.sendDocumentRequest(COMPANY_ID, documentRequestMessage())

    expect(publishingClient.sendMessage).toBeCalledWith(
      EVENT_NAME.RequestDocuments,
      `${COMPANY_ID}`,
      documentRequestMessage()
    )
  })

  it('send documents', async () => {
    await requestClient.sendDocuments(COMPANY_ID, sendDocumentsMessage())

    expect(publishingClient.sendMessage).toBeCalledWith(EVENT_NAME.SendDocuments, COMPANY_ID, sendDocumentsMessage())
  })

  it('throws ErrorMessage error', async () => {
    const error = new MessagingError('error')
    publishingClient.sendMessage.mockRejectedValue(error)
    const call = requestClient.sendDocuments(COMPANY_ID, sendDocumentsMessage())

    await expect(call).rejects.toThrow(error)
  })

  it('sends document request feedback message', async () => {
    await requestClient.sendDocumentFeedback(COMPANY_ID, documentFeedbackMessage())

    expect(publishingClient.sendMessage).toBeCalledWith(
      EVENT_NAME.SendDocumentFeedback,
      COMPANY_ID,
      documentFeedbackMessage()
    )
  })

  it('sends document dismiss message', async () => {
    await requestClient.sendDocumentRequestDismissType(COMPANY_ID, documentRequestDismissTypeMessage())

    expect(publishingClient.sendMessage).toBeCalledWith(
      EVENT_NAME.RequestDocumentsDismissedTypes,
      COMPANY_ID,
      documentRequestDismissTypeMessage()
    )
  })

  it('fails to send document dismiss message', async () => {
    const expectedError = new MessagingError('failed to send dismissal message')
    publishingClient.sendMessage.mockImplementationOnce(() => {
      throw expectedError
    })

    let errorToExpect
    try {
      await requestClient.sendDocumentRequestDismissType(COMPANY_ID, documentRequestDismissTypeMessage())
    } catch (error) {
      errorToExpect = error
    } finally {
      expect(errorToExpect).toMatchObject(expectedError)
    }
  })

  it('fails when sending document request feedback message', async () => {
    const error = new Error('error')
    publishingClient.sendMessage.mockImplementationOnce(() => {
      throw error
    })

    const call = requestClient.sendDocumentFeedback(COMPANY_ID, documentFeedbackMessage())
    await expect(call).rejects.toThrow(error)
  })

  it('sends document request note message', async () => {
    await requestClient.sendDocumentRequestNote(COMPANY_ID, documentRequestNoteMessage())

    expect(publishingClient.sendMessage).toBeCalledWith(
      EVENT_NAME.RequestDocumentsNote,
      COMPANY_ID,
      documentRequestNoteMessage()
    )
  })

  it('fails when sending document request note message', async () => {
    const error = new Error('error')
    publishingClient.sendMessage.mockImplementationOnce(() => {
      throw error
    })

    const call = requestClient.sendDocumentRequestNote(COMPANY_ID, documentRequestNoteMessage())
    await expect(call).rejects.toThrow(error)
  })
})
