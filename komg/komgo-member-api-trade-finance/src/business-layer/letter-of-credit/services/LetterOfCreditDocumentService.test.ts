import 'reflect-metadata'
import createMockInstance from 'jest-create-mock-instance'

import { ILetterOfCreditDocumentService } from './ILetterOfCreditDocumentService'
import { LetterOfCreditDocumentService } from './LetterOfCreditDocumentService'

import { IDocumentServiceClient, DocumentServiceClient } from '../../documents/DocumentServiceClient'
import { IDocumentRequestBuilder, DocumentRequestBuilder } from '../../documents/DocumentRequestBuilder'
import { DOCUMENT_PRODUCT, DOCUMENT_SUB_PRODUCT, DOCUMENT_TYPE } from '../../documents/documentTypes'
import { ILetterOfCredit, IDataLetterOfCredit, buildFakeLetterOfCredit } from '@komgo/types'

describe('LetterOfCreditDocumentService', () => {
  let letterOfCreditDocumentService: ILetterOfCreditDocumentService
  let mockDocServiceClient: jest.Mocked<IDocumentServiceClient>
  let mockDocRequestBuilder: jest.Mocked<IDocumentRequestBuilder>

  let letterOfCredit: ILetterOfCredit<IDataLetterOfCredit>
  let letterOfCreditContext: any
  let sampleDocument: any
  let applicantStaticId: string

  beforeEach(() => {
    mockDocServiceClient = createMockInstance(DocumentServiceClient)
    mockDocRequestBuilder = createMockInstance(DocumentRequestBuilder)

    letterOfCreditDocumentService = new LetterOfCreditDocumentService(mockDocServiceClient, mockDocRequestBuilder)

    sampleDocument = {
      id: 'document-id'
    }

    letterOfCredit = buildFakeLetterOfCredit()

    letterOfCreditContext = {
      productId: DOCUMENT_PRODUCT.TradeFinance,
      subProductId: DOCUMENT_SUB_PRODUCT.LC,
      staticId: letterOfCredit.staticId
    }

    applicantStaticId = letterOfCredit.templateInstance.data.applicant.staticId

    mockDocRequestBuilder.getLetterOfCreditDocumentContext.mockImplementation(() => {
      return letterOfCreditContext
    })

    mockDocServiceClient.getDocument.mockImplementation(() => {
      return sampleDocument
    })

    mockDocServiceClient.shareDocument.mockImplementation(() => {
      Promise.resolve(true)
    })
  })

  describe('shareDocument', () => {
    it('should share a document', async () => {
      const letterOfCreditDocumentRequest = {
        productId: DOCUMENT_PRODUCT.TradeFinance,
        documents: [sampleDocument.id],
        companies: [applicantStaticId]
      }

      mockDocRequestBuilder.buildShareableDocumentRequest.mockImplementation(() => {
        return letterOfCreditDocumentRequest
      })

      await letterOfCreditDocumentService.shareDocument(letterOfCredit, DOCUMENT_TYPE.LC, [applicantStaticId])

      expect(mockDocServiceClient.shareDocument).toHaveBeenCalled()
      expect(mockDocServiceClient.shareDocument).toHaveBeenCalledTimes(1)
      expect(mockDocServiceClient.shareDocument).toHaveBeenCalledWith(letterOfCreditDocumentRequest)
    })

    it('should return a ContentNotFoundException when a document is not found', async () => {
      mockDocServiceClient.getDocument.mockImplementation(() => {
        return null
      })

      try {
        await letterOfCreditDocumentService.shareDocument(letterOfCredit, DOCUMENT_TYPE.LC, [applicantStaticId])
        fail('it should never call this')
      } catch (error) {
        expect(error).toBeDefined()
        expect(error.message).toEqual(
          `Can't find document type: [${DOCUMENT_TYPE.LC}] for letterOfCredit: [${letterOfCredit.staticId}]`
        )
      }
    })

    it('should throw an error when getDocument crash', async () => {
      mockDocServiceClient.getDocument.mockImplementation(() => {
        throw new Error('crash')
      })

      try {
        await letterOfCreditDocumentService.shareDocument(letterOfCredit, DOCUMENT_TYPE.LC, [applicantStaticId])
        fail('it should never call this')
      } catch (error) {
        expect(error).toBeDefined()
        expect(error.message).toEqual(`crash`)
      }
    })
  })

  describe('deleteDocument', () => {
    it('should delete a document', async () => {
      mockDocServiceClient.getDocument.mockImplementation(() => {
        return sampleDocument
      })

      mockDocServiceClient.deleteDocument.mockImplementation(() => {
        Promise.resolve(true)
      })

      await letterOfCreditDocumentService.deleteDocument(letterOfCredit, DOCUMENT_TYPE.LC)

      expect(mockDocServiceClient.deleteDocument).toHaveBeenCalled()
      expect(mockDocServiceClient.deleteDocument).toHaveBeenCalledTimes(1)
      expect(mockDocServiceClient.deleteDocument).toHaveBeenCalledWith(DOCUMENT_PRODUCT.TradeFinance, sampleDocument.id)
    })

    it('should return false when a document is not found', async () => {
      mockDocServiceClient.getDocument.mockImplementation(() => {
        return null
      })

      const result = await letterOfCreditDocumentService.deleteDocument(letterOfCredit, DOCUMENT_TYPE.LC)

      expect(result).toEqual(false)
    })

    it('should throw an error when get document crash', async () => {
      mockDocServiceClient.getDocument.mockImplementation(() => {
        throw new Error('crash on getDocument')
      })

      try {
        const result = await letterOfCreditDocumentService.deleteDocument(letterOfCredit, DOCUMENT_TYPE.LC)
        fail('it shouldn"t raise this point')
      } catch (error) {
        expect(error).toBeDefined()
        expect(error.message).toEqual('crash on getDocument')
      }
    })
  })
})
