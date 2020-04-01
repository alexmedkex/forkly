import { ErrorCode } from '@komgo/error-utilities'
import { ErrorUtils, HttpException } from '@komgo/microservice-config'
import 'jest'
import 'reflect-metadata'

import DocumentDataAgent from '../../data-layer/data-agents/DocumentDataAgent'
import { DocumentState } from '../../data-layer/models/ActionStates'
import { IDocument } from '../../data-layer/models/document'
import { document, FILE_ID } from '../../data-layer/models/test-entities'
import { mock } from '../../mock-utils'
import { bufferToStream } from '../../utils'
import { CONTENT_TYPE, FILE_DATA, sendDocumentsMessage } from '../messaging/messages/test-messages'

import ServiceUtils from './ServiceUtils'

const sharedDocumentsSizeLimit = 100

describe('ServiceUtils', () => {
  let serviceUtils: ServiceUtils
  let documentRegistered: IDocument
  let documentDataAgent: DocumentDataAgent

  beforeEach(() => {
    jest.resetAllMocks()

    documentDataAgent = mock(DocumentDataAgent)

    serviceUtils = new ServiceUtils(documentDataAgent, sharedDocumentsSizeLimit)

    documentRegistered = document()
    documentRegistered.state = DocumentState.Registered
    documentDataAgent.getFileStream.mockReturnValue(bufferToStream(FILE_DATA))
    documentDataAgent.getFileContentType.mockReturnValue(CONTENT_TYPE)
  })

  it('converts correctly the documents to messages', async () => {
    const result = await serviceUtils.convertDocumentToMessages([documentRegistered])

    expect(documentDataAgent.getFileStream).toBeCalledWith(FILE_ID)
    expect(documentDataAgent.getFileContentType).toBeCalledWith(FILE_ID)
    expect(result).toEqual(sendDocumentsMessage().data.documents)
  })

  it('does not convert the documents to messages since it is empty', async () => {
    const result = await serviceUtils.convertDocumentToMessages([])

    expect(documentDataAgent.getFileStream).toHaveBeenCalledTimes(0)
    expect(result).toEqual([])
  })

  it('checks the document size without errors', async () => {
    documentDataAgent.getFileLength.mockReturnValue(sharedDocumentsSizeLimit)

    let errorToExpect
    try {
      await serviceUtils.checkDocumentsSize([documentRegistered])
    } catch (error) {
      errorToExpect = error
    } finally {
      expect(documentDataAgent.getFileLength).toBeCalledWith(documentRegistered.content.fileId)
      expect(errorToExpect).toBe(undefined)
    }
  })

  it('checks the document size with exception errors', async () => {
    const wrongSize = sharedDocumentsSizeLimit * 2
    documentDataAgent.getFileLength.mockReturnValue(wrongSize)

    const expectedError = ErrorUtils.requestEntityTooLargeException(
      ErrorCode.ValidationHttpContent,
      `Total files size ${wrongSize} exceeded limit ${sharedDocumentsSizeLimit}`
    )

    let errorToExpect
    try {
      await serviceUtils.checkDocumentsSize([documentRegistered])
    } catch (error) {
      errorToExpect = error
    } finally {
      expect(documentDataAgent.getFileLength).toBeCalledWith(documentRegistered.content.fileId)
      expect(errorToExpect).toMatchObject(expectedError)
    }
  })
})
