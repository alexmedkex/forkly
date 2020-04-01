import 'jest'
import 'reflect-metadata'
import * as _ from 'lodash'

import DocumentDataAgent from '../../../data-layer/data-agents/DocumentDataAgent'
import DuplicatedItem from '../../../data-layer/data-agents/exceptions/DuplicatedItem'
import { DocumentState } from '../../../data-layer/models/ActionStates'
import { document, owner } from '../../../data-layer/models/test-entities'
import { DocumentsTransactionManager } from '../../../infrastructure/blockchain/DocumentsTransactionManager'
import { mock } from '../../../mock-utils'
import { COMPANY_ID, PRODUCT_ID } from '../../../service-layer/utils/test-entities'
import { DocumentMessageData, SendDocumentsMessage } from '../messages'
import { MESSAGES_REGISTRATION_DATE, FILE_DATA, sendDocumentsMessage } from '../messages/test-messages'

import { DocumentProcessorUtils } from './DocumentProcessorUtils'
import { SendDocumentProcessor } from './SendDocumentProcessor'

const wildcardName = 'Hidden'

const documentMessageData: DocumentMessageData = sendDocumentsMessage().data.documents[0]

const expectedDocument = {
  ..._.omit(document(), ['comment', 'createdAt']),
  registrationDate: MESSAGES_REGISTRATION_DATE,
  content: {
    ...document().content,
    size: FILE_DATA.byteLength
  },
  owner: {
    firstName: wildcardName,
    lastName: wildcardName,
    companyId: owner().companyId
  },
  state: DocumentState.Registered
}

const FILE_ID = 'file-id'

jest.mock('merkle-tree-solidity')

describe('DocumentProcessorUtils', () => {
  let documentProcessorUtils: DocumentProcessorUtils
  let mockDocTxManager: any
  let documentDataAgent: any

  beforeEach(async () => {
    jest.resetAllMocks()
    mockDocTxManager = mock(DocumentsTransactionManager)
    documentDataAgent = mock(DocumentDataAgent)

    documentProcessorUtils = new DocumentProcessorUtils(documentDataAgent, async () => {
      return mockDocTxManager
    })

    documentDataAgent.existsWithId.mockReturnValue(false)
    documentDataAgent.saveFileBuffer.mockReturnValue(FILE_ID)
    mockDocTxManager.hash.mockReturnValue('someHash')
  })

  it('stores received files', async () => {
    await documentProcessorUtils.storeNewDocuments(COMPANY_ID, PRODUCT_ID, [documentMessageData])

    expect(documentDataAgent.create).toBeCalledWith(PRODUCT_ID, expectedDocument)
    expect(documentDataAgent.create).toHaveBeenCalledTimes(1)
    expect(documentDataAgent.saveFileBuffer).toBeCalledWith({
      id: undefined,
      fileName: documentMessageData.name,
      file: Buffer.from(documentMessageData.content.data, 'base64'),
      contentType: documentMessageData.content.contentType
    })
    expect(documentDataAgent.saveFileBuffer).toHaveBeenCalledTimes(1)
  })

  it('skip storing file if already exists', async () => {
    documentDataAgent.existsWithId.mockReturnValue(true)

    await documentProcessorUtils.storeNewDocuments(COMPANY_ID, PRODUCT_ID, [documentMessageData])

    expect(documentDataAgent.existsWithId).toBeCalledWith(PRODUCT_ID, expectedDocument.id)
    expect(documentDataAgent.existsWithId).toHaveBeenCalledTimes(1)
    expect(documentDataAgent.create).not.toBeCalled()
    expect(documentDataAgent.saveFileBuffer).not.toBeCalled()
  })

  it('processes a message if some of its entities were stored before', async () => {
    documentDataAgent.create.mockRejectedValue(new DuplicatedItem('Duplicate item'))

    await documentProcessorUtils.storeNewDocuments(COMPANY_ID, PRODUCT_ID, [documentMessageData])

    expect(documentDataAgent.create).toBeCalledWith(PRODUCT_ID, expectedDocument)
    expect(documentDataAgent.create).toHaveBeenCalledTimes(1)
  })

  it('does not store anything when no documents', async () => {
    await documentProcessorUtils.storeNewDocuments(COMPANY_ID, PRODUCT_ID, [])
    expect(documentDataAgent.existsWithId).toHaveBeenCalledTimes(0)
  })
})
