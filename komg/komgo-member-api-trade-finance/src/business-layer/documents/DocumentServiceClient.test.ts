import 'reflect-metadata'

const mockAxiosGet = jest.fn()
const mockAxiosPost = jest.fn<{}>()
jest.mock('request-promise', () => ({
  post: mockAxiosPost
}))

jest.mock('axios', () => ({
  default: {
    get: mockAxiosGet,
    post: mockAxiosPost
  }
}))

import { DocumentServiceClient } from './DocumentServiceClient'
import { DOCUMENT_PRODUCT, DOCUMENT_CATEGORY, DOCUMENT_TYPE } from './documentTypes'
import { IShareDocument } from './IShareDocument'
import { MicroserviceConnectionException, DuplicateDocumentException } from '../../exceptions'
import { documentResponse, documentReceivedResponse, TYPE_ID, sharedDocumentsResponse } from '../test-entities'

const mockDocument = {
  productId: DOCUMENT_PRODUCT.TradeFinance,
  categoryId: DOCUMENT_CATEGORY.TradeDocuments,
  typeId: DOCUMENT_TYPE.LC,

  owner: {
    firstName: '-',
    lastName: '-',
    companyId: '1'
  },
  metadata: [],
  name: 'test',
  documentData: {
    originalname: 'filename.jpg',
    // buffer: Buffer
    mimetype: 'image/jpeg'
  }
}

const shareDocRequest: IShareDocument = {
  productId: 'tradeFinance',
  documents: ['1'],
  companies: ['c1', 'c2']
}
const lcDocument = documentResponse()

const requestError = {
  error: {
    message: 'test'
  }
}

describe('DocumentServiceClient', () => {
  let client
  let logger

  beforeEach(() => {
    mockAxiosPost.mockClear()
    mockAxiosGet.mockClear()

    // mockAxiosGet.mockImplementation(() => ({ data: [] }))
    // mockAxiosPost.mockImplementation(() => ({ data: {} }))

    client = new DocumentServiceClient('', 10)
    logger = (client as any).logger
    logger.error = jest.fn()
  })

  describe('registerDocument', () => {
    it('should post data', async () => {
      mockAxiosPost.mockImplementation(() => ({ data: {} }))
      await client.registerDocument(mockDocument)

      expect(mockAxiosPost).toHaveBeenCalled()
    })

    it('should log an error and throw if request.post fails', async () => {
      mockAxiosPost.mockImplementation(() => {
        throw requestError
      })

      await expect(client.registerDocument(mockDocument)).rejects.toBeInstanceOf(MicroserviceConnectionException)
      expect(logger.error).toHaveBeenCalled()
    })

    it('should log an error and throw if request.post fails with 409', async () => {
      mockAxiosPost.mockImplementation(() => {
        throw {
          statusCode: 409,
          error: {
            message: 'failed to register document'
          }
        }
      })

      await expect(client.registerDocument(mockDocument)).rejects.toBeInstanceOf(DuplicateDocumentException)
      expect(logger.error).toHaveBeenCalled()
    })
  })

  describe('shareDocument', () => {
    it('should submit request for every company', async () => {
      mockAxiosPost.mockReturnValue(Promise.resolve())
      await client.shareDocument(shareDocRequest)

      expect(mockAxiosPost.mock.calls[0][1]).toEqual({
        documents: shareDocRequest.documents,
        companyId: shareDocRequest.companies[0],
        reviewNotRequired: true
      })

      expect(mockAxiosPost.mock.calls[1][1]).toEqual({
        documents: shareDocRequest.documents,
        companyId: shareDocRequest.companies[1],
        reviewNotRequired: true
      })
    })

    it('should log errors if request fails', async () => {
      mockAxiosPost.mockImplementation(() => Promise.reject())
      await client.shareDocument(shareDocRequest)

      expect(logger.error).toHaveBeenCalledTimes(2)
    })
  })

  describe('getDocumentType', () => {
    it('should get documents', async () => {
      mockAxiosGet.mockImplementation(() => {
        return { data: {} }
      })
      const productId = 'product-id-1'
      await client.getDocumentTypes(productId)
      expect(mockAxiosGet).toHaveBeenCalledWith(`/v0/products/${productId}/types`)
    })
  })

  describe('getRegisteredDocument', () => {
    it('should get documents', async () => {
      mockAxiosGet.mockImplementation(() => {
        return { data: [lcDocument] }
      })
      const documents = await client.getDocuments('tradeFinance', {})

      expect(mockAxiosGet).toHaveBeenCalled()
      expect(documents).toEqual([lcDocument])
    })

    it('should get document', async () => {
      mockAxiosGet.mockImplementation(() => {
        return { data: [lcDocument] }
      })
      const document = await client.getDocument('tradeFinance', TYPE_ID, {})

      expect(mockAxiosGet).toHaveBeenCalled()
      expect(document).toEqual(lcDocument)
    })

    it('should log an error and throw if request.post fails', async () => {
      mockAxiosGet.mockImplementation(() => {
        throw requestError
      })

      await expect(client.getDocuments('tradeFinance', {})).rejects.toBeInstanceOf(MicroserviceConnectionException)
    })
  })

  describe('getDocumentById', () => {
    it('should get document', async () => {
      mockAxiosGet.mockImplementation(() => {
        return { data: { id: 1 } }
      })
      const productId = 'product-id-1'
      const doc = await client.getDocumentById(productId, '1')
      expect(mockAxiosGet).toHaveBeenCalledWith(`/v0/products/${productId}/documents/1`)
      expect(doc).toMatchObject({ id: 1 })
    })

    it('should return null if doc not found', async () => {
      mockAxiosGet.mockImplementation(() => {
        return { status: 404 }
      })
      const productId = 'product-id-1'
      const doc = await client.getDocumentById(productId, '1')

      expect(mockAxiosGet).toHaveBeenCalledWith(`/v0/products/${productId}/documents/1`)
      expect(doc).toBeNull()
    })
  })

  describe('getDocumentContent', () => {
    it('should get document content', async () => {
      mockAxiosGet.mockImplementation(() => {
        return { data: Buffer.from([]) }
      })
      const productId = 'product-id-1'
      const doc = await client.getDocumentContent(productId, '1')
      expect(mockAxiosGet).toHaveBeenCalledWith(`/v0/products/${productId}/documents/1/content`, {
        responseType: 'arraybuffer'
      })
      expect(doc).toMatchObject({ data: Buffer.from([]) })
    })
  })

  describe('getReceivedDocuments', () => {
    it('should get received documents', async () => {
      mockAxiosGet.mockImplementation(() => {
        return { data: [documentReceivedResponse()] }
      })
      const productId = 'product-id-1'
      const context = { subProductId: '1' }
      const result = await client.getReceivedDocuments(productId, context)
      expect(mockAxiosGet).toHaveBeenCalledWith(
        `/v0/products/${productId}/received-documents?context=${encodeURIComponent(JSON.stringify(context))}`
      )
      expect(result).toMatchObject([documentReceivedResponse()])
    })
  })

  describe('sendDocumentFeedback', () => {
    it('should post send document feedback', async () => {
      mockAxiosPost.mockImplementation(() => ({ data: {} }))
      const productId = 'product-id-1'
      const receivedDocumentsId = 'received-doc-id'
      const result = await client.sendDocumentFeedback(productId, receivedDocumentsId)
      expect(mockAxiosPost).toHaveBeenCalledWith(
        `/v0/products/${productId}/received-documents/${receivedDocumentsId}/send-feedback`
      )
    })
  })

  describe('getSendDocumentFeedback', () => {
    it('should get send documents', async () => {
      mockAxiosGet.mockImplementation(() => {
        return { data: [sharedDocumentsResponse()] }
      })
      const productId = 'product-id-1'
      const context = { subProductId: '1' }
      const result = await client.getSendDocumentFeedback(productId, context)
      expect(mockAxiosGet).toHaveBeenCalledWith(
        `/v0/products/${productId}/send-documents?context=${encodeURIComponent(JSON.stringify(context))}`
      )
      expect(result).toMatchObject([sharedDocumentsResponse()])
    })
  })
})
