import 'jest'
import 'reflect-metadata'

import mockingoose from 'mockingoose'

import { mock } from '../../mock-utils'
import * as TestData from '../models/test-entities'
import DocumentDataAgent from './DocumentDataAgent'
import GridFsWrapper from './GridFsWrapper'
import { createCommonTests, removeId } from './test-utils'
import { DocumentState } from '../models/ActionStates'
import { IDocument } from '../models/document'
import { DOCUMENT_ID, FILE_ID, PRODUCT_ID, DOCUMENT_NAME } from '../../service-layer/utils/test-entities'

const document = TestData.document()

describe('DocumentDataAgent', () => {
  let agent: DocumentDataAgent
  let gridFs

  beforeEach(async () => {
    gridFs = mock(GridFsWrapper)
    agent = new DocumentDataAgent(gridFs)
  })

  createCommonTests(mockingoose.Document, new DocumentDataAgent(gridFs), document)

  it('find document by id - true if it exists', async () => {
    mockingoose.Document.toReturn(document, 'findOne')

    const result = await agent.existsWithId(TestData.PRODUCT_ID, 'some-id')
    expect(result).toBe(true)
  })

  it('find document by id - false if it does not exist', async () => {
    mockingoose.Document.toReturn(null, 'findOne')

    const result = await agent.existsWithId(TestData.PRODUCT_ID, 'some-id')
    expect(result).toBe(false)
  })

  it('delete document by id', async () => {
    mockingoose.Document.toReturn(document, 'findOne')
    mockingoose.Document.toReturn(document, 'findOneAndRemove')
    gridFs.deleteFile.mockImplementationOnce(() => document)

    await agent.delete(TestData.PRODUCT_ID, DOCUMENT_ID)
  })

  it('get document file content type by file id', async () => {
    const type = 'text/pdf'
    gridFs.getFileContentType.mockImplementationOnce(() => type)

    const result = await agent.getFileContentType(FILE_ID)
    expect(result).toEqual(type)
  })

  it('check if document exists by name', async () => {
    mockingoose.Document.toReturn(document, 'findOne')

    const result = await agent.existsWithName(PRODUCT_ID, DOCUMENT_NAME)
    expect(result).toEqual(true)
  })

  it('update download status by user', async () => {
    mockingoose.Document.toReturn(document, 'findOneAndUpdate')

    await agent.updateDownloadByUser(PRODUCT_ID, DOCUMENT_ID, TestData.USER_ID)
  })

  it('find document by merkle hash', async () => {
    mockingoose.Document.toReturn(document, 'findOne')

    const result = await agent.getByMerkleRoot(TestData.PRODUCT_ID, TestData.MERKLE_HASH)
    expect(result.toObject()).toMatchObject(removeId(document))
  })

  it('document with correct merkle hash exists', async () => {
    mockingoose.Document.toReturn(document, 'findOne')

    const result = await agent.existsWithMerkleRoot(TestData.PRODUCT_ID, TestData.MERKLE_HASH)
    expect(result).toEqual(true)
  })

  it('saves document to GridFS', async () => {
    await agent.saveFileBuffer(TestData.fileBuffer())

    expect(gridFs.saveFileBuffer).toBeCalledWith(TestData.fileBuffer())
  })

  it('update state of document in a non-pending state', async () => {
    mockingoose.Document.toReturn(document, 'findOne')
    const result: IDocument = await agent.updateDocumentState(
      TestData.PRODUCT_ID,
      TestData.DOCUMENT_ID,
      DocumentState.Registered
    )
    expect(result.state).toBe(DocumentState.Registered)
  })

  it('error on updating state if document already has an registered state', async () => {
    const confirmedDoc = TestData.document()
    confirmedDoc.state = DocumentState.Registered

    mockingoose.Document.toReturn(confirmedDoc, 'findOne')
    try {
      await agent.updateDocumentState(TestData.PRODUCT_ID, confirmedDoc.id, DocumentState.Registered)
    } catch (e) {
      expect(e).toBeDefined()
    }
  })

  it('error on updating state if document already has an failed state', async () => {
    const failedDoc = TestData.document()
    failedDoc.state = DocumentState.Failed

    mockingoose.Document.toReturn(failedDoc, 'findOne')
    try {
      await agent.updateDocumentState(TestData.PRODUCT_ID, failedDoc.id, DocumentState.Registered)
    } catch (e) {
      expect(e).toBeDefined()
    }
  })

  it('calls Document.find with condition', async () => {
    expect.assertions(1)
    const condition = { productId: 'tradeFinance' }
    mockingoose.Document.toReturn(query => {
      expect(query.getQuery()).toEqual(condition)
      return []
    }, 'find')

    await agent.getDocuments(condition)
  })

  it('gets all documents with context', async () => {
    mockingoose.Document.toReturn(document, 'find')

    const result = await agent.getAllWithContext(PRODUCT_ID, TestData.COMPANY_ID, document, undefined)
    expect(result).toBeDefined()
  })

  it('adds new entry to sharedWith in document', async () => {
    const result = await agent.shareDocumentsWithNewCounterparty('newcompanyId', PRODUCT_ID, DOCUMENT_ID, document)
  })

  it('calls findOneAndUpdate with correct arguments on resetTransactionId()', async () => {
    expect.assertions(1)
    mockingoose.Document.toReturn(query => {
      expect(query.getQuery()).toEqual({ _id: 'docId' })
    }, 'findOneAndUpdate')

    await agent.resetTransactionId('docId', 'transactionId')
  })
})
