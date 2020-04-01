import 'reflect-metadata'

import { ObjectId } from 'bson'
import * as _ from 'lodash'
import * as multer from 'multer'

import CategoryDataAgent from '../../data-layer/data-agents/CategoryDataAgent'
import DocumentDataAgent from '../../data-layer/data-agents/DocumentDataAgent'
import ItemNotFound from '../../data-layer/data-agents/exceptions/ItemNotFound'
import ProductDataAgent from '../../data-layer/data-agents/ProductDataAgent'
import TypeDataAgent from '../../data-layer/data-agents/TypeDataAgent'
import { DocumentState } from '../../data-layer/models/ActionStates'
import { IDocument } from '../../data-layer/models/document'
import * as TestData from '../../data-layer/models/test-entities'
import { CompaniesRegistryClient } from '../../infrastructure/api-registry/CompaniesRegistryClient'
import { DocumentsTransactionManager } from '../../infrastructure/blockchain/DocumentsTransactionManager'
import { mock } from '../../mock-utils'
import Clock from '../../utils/Clock'
import { UpdateDocumentRequest } from '../request/document'
import { DOCUMENT_NAME, FILE_ID, fullDocumentResponse, owner } from '../utils/test-entities'
import Uploader from '../utils/Uploader'

import { RegisterController } from './RegisterController'
import { expectError } from './test-utils'
import ControllerUtils from './utils'
import { Readable, Stream } from 'stream'
import * as fs from 'fs'
import { ReceivedDocumentsService } from '../../business-layer/services/ReceivedDocumentsService'
jest.mock('../../utils/updatePDFWithVerificationLink', { default: async () => {} })

const MockExpressRequest = require('mock-express-request')
const txManagerProvider = jest.fn()

multer.single = jest.fn(() => {
  return 'testing'
})

function mockReadable() {
  const streamMock = new Readable()
  streamMock._read = () => null
  streamMock.push(fs.readFileSync(`./src/utils/updatePDFWithVerificationLink/testing-files/blank.pdf`))
  streamMock.push(null)
  return streamMock
}

const mockedUserId = 'mockedUserId'

describe('RegisterController', () => {
  const request = new MockExpressRequest({
    method: 'POST',
    url: '/products/{productId}/categories/{categoryId}/types/{typeId}/register/{docId}',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'multipart/form-data;'
    } // missing boundary and fileData
  })

  let txManager
  let documentDataAgent
  let productDataAgent
  let categoryDataAgent
  let typeDataAgent
  let uploader
  let companyRegistryClient
  let clock
  let controllerUtils
  let receivedDocumentsService

  let controller: RegisterController

  beforeEach(() => {
    jest.resetAllMocks()

    txManager = mock(DocumentsTransactionManager)
    documentDataAgent = mock(DocumentDataAgent)
    productDataAgent = mock(ProductDataAgent)
    categoryDataAgent = mock(CategoryDataAgent)
    typeDataAgent = mock(TypeDataAgent)
    uploader = mock(Uploader)
    companyRegistryClient = mock(CompaniesRegistryClient)
    clock = mock(Clock)
    receivedDocumentsService = mock(ReceivedDocumentsService)
    txManagerProvider.mockResolvedValue(txManager)

    productDataAgent.exists.mockResolvedValue(true)
    categoryDataAgent.exists.mockResolvedValue(true)
    typeDataAgent.exists.mockResolvedValue(true)
    documentDataAgent.create.mockResolvedValue(TestData.document())

    productDataAgent.getAll.mockReturnValue([TestData.product()])
    productDataAgent.getById.mockResolvedValue(TestData.product())
    categoryDataAgent.getById.mockResolvedValue(TestData.fullCategory())
    typeDataAgent.getById.mockResolvedValue(TestData.fullType())

    documentDataAgent.saveFileBuffer.mockResolvedValue(FILE_ID)
    txManager.signDocument.mockResolvedValue(TestData.SIGNATURE)
    txManager.submitDocHashes.mockResolvedValue(TestData.TX_ID)
    txManager.hash.mockReturnValue(TestData.CONTENT_HASH)
    txManager.merkle.mockReturnValue(TestData.MERKLE_HASH)

    uploader.upload.mockResolvedValue({
      file: {
        originalname: 'name',
        mimetype: 'application/pdf',
        buffer: new Buffer('123', 'utf8')
      },
      body: {
        extraData: JSON.stringify({
          metadata: TestData.metadata(),
          owner: owner(),
          name: DOCUMENT_NAME,
          comment: 'string'
        })
      }
    })

    clock.currentTime.mockReturnValue(TestData.EXPECTED_DATE)
    controllerUtils = new ControllerUtils(productDataAgent, typeDataAgent, null, null)
    controller = new RegisterController(
      txManagerProvider,
      documentDataAgent,
      productDataAgent,
      categoryDataAgent,
      typeDataAgent,
      uploader,
      companyRegistryClient,
      clock,
      controllerUtils,
      receivedDocumentsService
    )
  })

  it('upload document, signs and registers', async () => {
    const createdDoc = {
      ...TestData.document(),
      hash: undefined,
      content: {
        // document not signed, no signature!
        size: 3
      }
    }

    const someSignature = 'dummy signature'

    const signedDoc = {
      ...createdDoc,
      content: {
        ...createdDoc.content,
        signature: someSignature // signed
      },
      uploadInfo: {
        transactionId: TestData.TX_ID,
        uploaderUserId: TestData.USER_ID
      }
    }

    documentDataAgent.getBareById.mockResolvedValue(createdDoc)
    documentDataAgent.findAndUpdate.mockResolvedValue(signedDoc)
    txManager.signDocument.mockResolvedValue(someSignature)

    documentDataAgent.existsWithId.mockResolvedValue(true)

    const newDocument = await controller.upload(request, TestData.PRODUCT_ID, TestData.CATEGORY_ID, TestData.TYPE_ID)

    expect(uploader.upload).toBeCalledWith(request)

    expect(newDocument).toEqual({
      ...fullDocumentResponse(),
      content: signedDoc.content,
      hash: signedDoc.hash,
      uploadInfo: {
        uploaderUserId: TestData.USER_ID
      }
    })
  })

  it('upload document fails when creating document record', async () => {
    documentDataAgent.create.mockRejectedValue(new ItemNotFound('not found'))
    documentDataAgent.delete.mockResolvedValue()

    const call = controller.upload(request, TestData.PRODUCT_ID, TestData.CATEGORY_ID, TestData.TYPE_ID)

    await expectError(404, 'not found', call)
  })

  it('upload succeeds but sign & registration fails', async () => {
    const createdDoc = {
      ...TestData.fullDocument(),
      registrationDate: Date.now(),
      createdAt: Date.now(),
      content: {
        // document not signed, no signature!
        size: 3
      }
    }

    documentDataAgent.create.mockResolvedValue(createdDoc)

    // throws error but should keep the upload
    txManager.signDocument.mockRejectedValue(new Error('Signing has failed'))

    let error
    try {
      await controller.upload(request, TestData.PRODUCT_ID, TestData.CATEGORY_ID, TestData.TYPE_ID)
    } catch (e) {
      error = e
    }

    const errorUploadedDoc = {
      ..._.omit(createdDoc, 'createdAt'),
      receivedDate: createdDoc.createdAt
    }

    expect(uploader.upload).toBeCalledWith(request)
    expect(JSON.parse(error.message)).toEqual(errorUploadedDoc)
  })

  it('sign existing pending document', async () => {
    const unsignedDocument: IDocument = setupUnsignedDocument()

    const signedDoc = {
      ...unsignedDocument,
      content: {
        ...unsignedDocument.content,
        signature: 'someSignature' //signed
      }
    }

    documentDataAgent.findAndUpdate.mockResolvedValue(signedDoc)

    const docResponse = await controller.signDocument(unsignedDocument)
    expect(docResponse.content.signature).toBeDefined()
  })

  it('register fails when document is not yet signed', async () => {
    const document: IDocument = setupUnsignedDocument()

    const call = controller.registerDocument(document)
    await expectError(400, 'Document is not signed yet', call)
  })

  it('register signed document successfully', async () => {
    const document = {
      ...TestData.document(),
      uploadInfo: {
        transactionId: TestData.TX_ID,
        uploaderUserId: TestData.USER_ID
      }
    }

    documentDataAgent.findAndUpdate.mockResolvedValue(document)

    const result = await controller.registerDocument(document)
    expect(result).toEqual(document)

    expect(txManager.submitDocHashes).toHaveBeenCalledTimes(1)
    expect(txManager.submitDocHashes).toHaveBeenCalledWith([TestData.MERKLE_HASH], new ObjectId(TestData.TX_ID))
  })

  it('registers two hashes for documents with komgo stamp', async () => {
    const document = {
      ...TestData.document(),
      komgoStamp: true,
      uploadInfo: {
        transactionId: TestData.TX_ID,
        uploaderUserId: TestData.USER_ID
      }
    }

    documentDataAgent.findAndUpdate.mockResolvedValue(document)

    const result = await controller.registerDocument(document)
    expect(result).toEqual(document)

    expect(txManager.submitDocHashes).toHaveBeenCalledTimes(1)
    expect(txManager.submitDocHashes).toHaveBeenCalledWith(
      [TestData.MERKLE_HASH, TestData.CONTENT_HASH],
      new ObjectId(TestData.TX_ID)
    )
  })

  it('generates a new transaction id if a document is not in a pending state', async () => {
    const document = {
      ...TestData.document(),
      uploadInfo: {
        transactionId: TestData.TX_ID,
        uploaderUserId: TestData.USER_ID
      },
      state: DocumentState.Failed
    }

    documentDataAgent.findAndUpdate.mockResolvedValue(document)

    const result = await controller.registerDocument(document)
    expect(result.uploadInfo.transactionId).not.toEqual(TestData.TX_ID)

    expect(txManager.submitDocHashes).toHaveBeenCalledTimes(1)
  })

  it('throws an exception if registering a document that has already been registered', async () => {
    const document = {
      ...TestData.document(),
      uploadInfo: {
        transactionId: TestData.TX_ID,
        uploaderUserId: TestData.USER_ID
      },
      state: DocumentState.Registered
    }

    documentDataAgent.findAndUpdate.mockResolvedValue(document)

    const call = controller.registerDocument(document)
    await expectError(422, 'Document has been succesfully registered', call)

    expect(txManager.submitDocHashes).toHaveBeenCalledTimes(0)
  })

  it('failed delete document that has been shared', async () => {
    const docIdToDelete = 'id_to_delete'

    documentDataAgent.getById.mockResolvedValue({
      ...TestData.fullDocument(),
      sharedWith: [{ counterpartyId: 'some-static-id-value', sharedDates: [new Date()] }]
    })

    const call = controller.DeleteDocument(TestData.PRODUCT_ID, docIdToDelete)

    await expectError(422, 'Document has been shared with us! Unable to delete!', call)
  })

  it('failed delete document that we received', async () => {
    const docIdToDelete = 'id_to_delete'

    documentDataAgent.getById.mockResolvedValue({
      ...TestData.fullDocument(),
      sharedBy: 'some-statid-id-value',
      sharedWith: []
    })

    const call = controller.DeleteDocument(TestData.PRODUCT_ID, docIdToDelete)
    await expectError(422, 'Document has been shared with us! Unable to delete!', call)
  })

  it('failed delete because document was not found', async () => {
    const docIdToDelete = 'id_to_delete'

    documentDataAgent.getById.mockImplementation((productId, id) => {
      return null
    })

    const call = controller.DeleteDocument(TestData.PRODUCT_ID, docIdToDelete)
    await expectError(404, 'Document not found', call)
  })

  it('successfully delete document', async () => {
    const docIdToDelete = 'id_to_delete'

    documentDataAgent.getById.mockResolvedValue({
      ...TestData.fullDocument(),
      sharedBy: 'none',
      sharedWith: []
    })

    const docDeleted = await controller.DeleteDocument(TestData.PRODUCT_ID, docIdToDelete)

    const mockedFullDocNotShared = fullDocumentResponse()
    mockedFullDocNotShared.sharedBy = 'none'
    mockedFullDocNotShared.sharedWith = []
    expect(docDeleted).toEqual(mockedFullDocNotShared)
  })

  it('update document state', async () => {
    // upload first
    documentDataAgent.getById.mockResolvedValue({
      ...TestData.document(),
      sharedBy: 'none',
      sharedWith: []
    })

    documentDataAgent.update.mockResolvedValue({
      ...TestData.document(),
      state: DocumentState.Registered
    })

    const newDocument = await controller.uploadFile(
      request,
      TestData.PRODUCT_ID,
      TestData.CATEGORY_ID,
      TestData.TYPE_ID
    )

    const updateRequest: UpdateDocumentRequest = {
      id: newDocument.id,
      productId: newDocument.product.id,
      categoryId: newDocument.category.id,
      typeId: newDocument.type.id,
      state: DocumentState.Registered
    }

    const updatedDocument = await controller.UpdateDocument(TestData.PRODUCT_ID, updateRequest)
    expect(updatedDocument).toBeDefined()
    expect(updatedDocument.state).toBe(DocumentState.Registered)
  })

  it('rejects invalid upload request', async () => {
    uploader.upload.mockResolvedValue({})
    const call = controller.uploadFile(request, TestData.PRODUCT_ID, 'banking', 'banking-documents')

    await expect(call).rejects.toThrow()
  })

  it('uploads a file', async () => {
    documentDataAgent.getById.mockResolvedValue({
      ...TestData.document(),
      sharedBy: 'none',
      sharedWith: []
    })

    const newDocument = await controller.uploadFile(
      request,
      TestData.PRODUCT_ID,
      TestData.CATEGORY_ID,
      TestData.TYPE_ID
    )

    expect(uploader.upload).toBeCalledWith(request)
    expect(documentDataAgent.create).toBeCalledWith(TestData.PRODUCT_ID, {
      ..._.omit(TestData.document(), ['createdAt']),
      context: undefined,
      hash: TestData.MERKLE_HASH,
      contentHash: `0x${TestData.CONTENT_HASH}`,
      id: undefined,
      content: {
        ...TestData.fileContent(),
        size: 3
      },
      sharedBy: 'none'
    })

    const updateArgs = documentDataAgent.update.mock.calls[0]
    expect(updateArgs[0]).toEqual(TestData.PRODUCT_ID)
    expect(updateArgs[1]).toMatchObject({
      uploadInfo: {
        transactionId: TestData.TX_ID
      }
    })

    expect(newDocument).toEqual({
      ...fullDocumentResponse(),
      uploadInfo: {
        uploaderUserId: undefined
      }
    })
  })

  it('when uploading documents, fails to submit hash to blockchain-signer', async () => {
    txManager.submitDocHashes.mockImplementation(() => {
      throw new Error('failed to submit')
    })

    documentDataAgent.delete.mockResolvedValue(null)

    documentDataAgent.getById.mockResolvedValue({
      ...TestData.document(),
      sharedBy: 'none',
      sharedWith: []
    })

    const call = controller.uploadFile(
      request,
      TestData.PRODUCT_ID,
      TestData.CATEGORY_ID,
      TestData.TYPE_ID,
      'jwt token'
    )

    // TODO: Improve error response when fails to submit hash
    await expectError(500, 'Internal Server Error', call)
  })

  it('download document content', async () => {
    controllerUtils = mock(ControllerUtils)
    controllerUtils.fetchUserIdByJwt.mockResolvedValue(mockedUserId)

    controller = new RegisterController(
      txManagerProvider,
      documentDataAgent,
      productDataAgent,
      categoryDataAgent,
      typeDataAgent,
      uploader,
      companyRegistryClient,
      clock,
      controllerUtils,
      receivedDocumentsService
    )

    documentDataAgent.getById.mockReturnValue(TestData.document())
    documentDataAgent.getFileContentType.mockReturnValue('any')
    documentDataAgent.getFileStream.mockResolvedValue(mockReadable())

    const request = new MockExpressRequest({
      method: 'GET',
      url: '/products/{productId}/documents/{documentId}/content/',
      headers: {
        Accept: '*'
      }
    })

    request.res = {
      set: jest.fn(),
      write: jest.fn()
    } as Express.Response

    const response = await controller.DownloadFile(
      request,
      TestData.PRODUCT_ID,
      TestData.DOCUMENT_ID,
      false,
      'random token'
    )

    expect(controllerUtils.fetchUserIdByJwt).toHaveBeenCalled()
    expect(documentDataAgent.updateDownloadByUser).toHaveBeenCalledTimes(1)
    expect(documentDataAgent.updateDownloadByUser).toBeCalledWith(
      TestData.PRODUCT_ID,
      TestData.DOCUMENT_ID,
      mockedUserId
    )
    expect(documentDataAgent.getById).toBeCalledWith(TestData.PRODUCT_ID, TestData.DOCUMENT_ID)
  })

  it('search all documents by product id', async () => {
    documentDataAgent.getAllWithContext.mockReturnValue([TestData.fullDocument()])
    const documents = await controller.Find(TestData.PRODUCT_ID)

    expect(documents).toEqual([fullDocumentResponse()])
    expect(documentDataAgent.getAllWithContext).toBeCalledWith(TestData.PRODUCT_ID, undefined, undefined, null)
  })

  it('search all documents using a regex query', async () => {
    documentDataAgent.getAllWithContext.mockReturnValue([TestData.fullDocument()])
    const documents = await controller.Find(TestData.PRODUCT_ID, undefined, undefined, 'test')

    expect(documents).toEqual([fullDocumentResponse()])
    expect(documentDataAgent.getAllWithContext).toBeCalledWith(
      TestData.PRODUCT_ID,
      undefined,
      undefined,
      new RegExp('test')
    )
  })

  it('should return 422 error code if receives invalid regular expression', async () => {
    documentDataAgent.getAllWithContext.mockReturnValue([TestData.fullDocument()])
    const call = controller.Find(TestData.PRODUCT_ID, undefined, undefined, '\\')

    await expectError(422, 'Invalid regex: "\\"', call)
  })

  it('get document by id', async () => {
    documentDataAgent.getById.mockReturnValue(TestData.fullDocument())

    const document = await controller.GetById(TestData.PRODUCT_ID, TestData.DOCUMENT_ID)
    expect(document).toEqual(fullDocumentResponse())
  })

  it('return 404 if document does not exist', async () => {
    documentDataAgent.getById.mockRejectedValue(new ItemNotFound('Document not found'))
    await expectError(404, 'Document not found', controller.GetById(TestData.PRODUCT_ID, 'non-existing'))
  })
})

const setupUnsignedDocument = (): IDocument => {
  const defaultTestDoc = TestData.document()

  const document: IDocument = {
    ...defaultTestDoc,
    content: {
      ...defaultTestDoc.content,
      signature: undefined
    }
  }

  return document
}
