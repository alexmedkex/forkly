import 'reflect-metadata'

const loggerMock = {
  info: jest.fn(),
  error: jest.fn()
}
const getLoggerMock = jest.fn(() => loggerMock)
jest.mock('@komgo/logging', () => ({
  getLogger: getLoggerMock
}))

import { ErrorCode } from '@komgo/error-utilities'

import OutgoingRequestDataAgent from '../../../data-layer/data-agents/OutgoingRequestDataAgent'
import { COMPANY_ID, PRODUCT_ID } from '../../../data-layer/models/test-entities'
import { mock } from '../../../mock-utils'
import { ErrorName } from '../../../utils/ErrorName'
import { EVENT_NAME } from '../enums'
import { DocumentRequestDismissTypeMessage } from '../messages/DocumentRequestDismissTypeMessage'
import { documentRequestDismissTypeMessage } from '../messages/test-messages'

import { DocumentRequestDismissTypeProcessor } from './DocumentRequestDismissTypeProcessor'

const outgoingRequestDataAgent = mock(OutgoingRequestDataAgent)

describe('DocumentRequestDismissTypeProcessor', () => {
  let documentRequestDismissTypeProcessor: DocumentRequestDismissTypeProcessor

  beforeEach(async () => {
    outgoingRequestDataAgent.findAndUpdate.mockReset()

    documentRequestDismissTypeProcessor = new DocumentRequestDismissTypeProcessor(outgoingRequestDataAgent)
  })

  it('subscribes to correct events', () => {
    expect(documentRequestDismissTypeProcessor.eventNames()).toEqual([EVENT_NAME.RequestDocumentsDismissedTypes])
  })

  it('stores received dismissal message from receiver', async () => {
    const docReqDismissTypeMessage: DocumentRequestDismissTypeMessage = documentRequestDismissTypeMessage()

    await documentRequestDismissTypeProcessor.processEvent(COMPANY_ID, docReqDismissTypeMessage)

    const { requestId, dismissedTypes } = docReqDismissTypeMessage.data
    expect(outgoingRequestDataAgent.findAndUpdate).toBeCalledWith(PRODUCT_ID, requestId, {
      dismissedTypes: docReqDismissTypeMessage.data.dismissedTypes
    })
    expect(outgoingRequestDataAgent.findAndUpdate).toHaveBeenCalledTimes(1)
  })

  it('logs an error when error updating the db with the types dismissed', async () => {
    const error = new Error('Database error')
    outgoingRequestDataAgent.findAndUpdate.mockImplementationOnce(() => {
      throw error
    })

    await documentRequestDismissTypeProcessor.processEvent(COMPANY_ID, documentRequestDismissTypeMessage())
    expect(loggerMock.error).toHaveBeenCalledWith(
      ErrorCode.ValidationInternalAMQP,
      ErrorName.DocumentRequestEventError,
      'Error processing a dismissed document type event',
      {
        senderStaticId: COMPANY_ID,
        errorMessage: error.message,
        event: documentRequestDismissTypeMessage()
      }
    )
  })
})
