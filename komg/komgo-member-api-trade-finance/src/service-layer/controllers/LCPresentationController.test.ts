import { createMockInstance } from 'jest-create-mock-instance'
import 'reflect-metadata'
import { LCPresentationStatus } from '@komgo/types'
import { DocumentRequestBuilder, IDocumentRequestBuilder } from '../../business-layer/documents/DocumentRequestBuilder'
import { DocumentService } from '../../business-layer/documents/DocumentService'
import { DocumentServiceClient, IDocumentServiceClient } from '../../business-layer/documents/DocumentServiceClient'
import { IDocumentRegisterResponse } from '../../business-layer/documents/IDocumentRegisterResponse'
import { LC_STATE } from '../../business-layer/events/LC/LCStates'
import { documentResponse } from '../../business-layer/test-entities'
import { LCCacheDataAgent } from '../../data-layer/data-agents'
import Uploader from '../utils/Uploader'
import { LCPresentationController } from './LCPresentationController'
import { DOCUMENT_CATEGORY, DOCUMENT_PRODUCT } from '../../business-layer/documents/documentTypes'
import { LCPresentationService } from '../../business-layer/lc-presentation/LCPresentationService'
import { LCPresentationReviewService } from '../../business-layer/lc-presentation/LCPresentationReviewService'
import { HttpException } from '@komgo/microservice-config'
import { MicroserviceConnectionException, InvalidOperationException } from '../../exceptions'

const MockExpressRequest = require('mock-express-request')

const lcDataAgentMock = createMockInstance(LCCacheDataAgent)
const uploaderMock = createMockInstance(Uploader)
const documentService = createMockInstance(DocumentService)
const lCPresentationServiceMock = createMockInstance(LCPresentationService)
const lcPresentationReviewServiceMock = createMockInstance(LCPresentationReviewService)

let documentClientMock: IDocumentServiceClient
let documentRequestBuilderMock: IDocumentRequestBuilder

let controller: LCPresentationController

const lcDocument: IDocumentRegisterResponse = {
  id: 'document-1',
  name: 'test-document',
  ...documentResponse()
}
const id = '123'
const jwt: string =
  'Bearer eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJCZTB6VktGN1BGTGtKTGVHaGNOVzU0ckhUckRBZThkVERqYUJTMjFkMFZjIn0.eyJqdGkiOiJhNTUyM2RhZS0yMDEwLTQyZWEtOTM0Yy1iOGY1Yzg4NjhjZGYiLCJleHAiOjE1NDMzMjcxMjUsIm5iZiI6MCwiaWF0IjoxNTQzMzI2ODI1LCJpc3MiOiJodHRwOi8vbG9jYWxob3N0OjgwNzAvYXV0aC9yZWFsbXMvS09NR08iLCJhdWQiOiJ3ZWItYXBwIiwic3ViIjoiN2EyZmQwMzYtNTBlOC00NzA2LTllOWQtMzgyNWVlNjY1YmQ5IiwidHlwIjoiQmVhcmVyIiwiYXpwIjoid2ViLWFwcCIsIm5vbmNlIjoiZTNiNDY5MWQtYTUxMi00YjZhLTg3MDktYzcwZjI4MmUwOGQ5IiwiYXV0aF90aW1lIjoxNTQzMzI2ODI1LCJzZXNzaW9uX3N0YXRlIjoiNzE5NjQxNjUtMjNjZi00MWI4LWE5ZTAtOTdiODY5NjIwZjMxIiwiYWNyIjoiMSIsImFsbG93ZWQtb3JpZ2lucyI6WyJodHRwOi8vbG9jYWxob3N0OjMwMTAiXSwicmVhbG1fYWNjZXNzIjp7InJvbGVzIjpbIm9mZmxpbmVfYWNjZXNzIiwidHJhZGVGaW5hbmNlT2ZmaWNlciIsIm1pZGRsZUFuZEJhY2tPZmZpY2VyIiwidXNlckFkbWluIiwidW1hX2F1dGhvcml6YXRpb24iLCJyZWxhdGlvbnNoaXBNYW5hZ2VyIiwia3ljQW5hbHlzdCIsImNvbXBsaWFuY2VPZmZpY2VyIl19LCJyZXNvdXJjZV9hY2Nlc3MiOnsicmVhbG0tbWFuYWdlbWVudCI6eyJyb2xlcyI6WyJtYW5hZ2UtdXNlcnMiXX0sImFjY291bnQiOnsicm9sZXMiOlsibWFuYWdlLWFjY291bnQiLCJtYW5hZ2UtYWNjb3VudC1saW5rcyIsInZpZXctcHJvZmlsZSJdfX0sInNjb3BlIjoib3BlbmlkIGVtYWlsIHByb2ZpbGUiLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwibmFtZSI6IlN1cGVyIFVzZXIiLCJwcmVmZXJyZWRfdXNlcm5hbWUiOiJzdXBlcnVzZXIiLCJnaXZlbl9uYW1lIjoiU3VwZXIiLCJmYW1pbHlfbmFtZSI6IlVzZXIiLCJlbWFpbCI6InN1cGVyQGtvbWdvLmlvIn0.HysQLhMcdockuZ0MuAmqW0L6VpuLy0bdvlHlVEHfsIADDaXKbRVkxe1kx0ezCMwLc6Uvp-ohy-2EyXXNUKhk_uoqqkKnhYLMIRD2cK9yIYvWi_Q1f5uazfBMnp53M8VQWxvzGPtJpAtYHmwKpLb5uK4XoiHpdEH1WnMYrWdM4dpzYcX-jygpnQX4oVgVUswybBwEUTn-OqY8wNNVX2GLbtKxTwi2OjCvPRVs-qZ5KJYpsYOq0Mpm1RrS-4A-CL942Eee5RYPFNvQNuZqcDGb2kNvnCNpC7Z954OgCrJ7m3MCjh2Ndw0K2Hp_D1IFk0O1LPdW-BS4kvgChQwjQEkG7A'

describe('LCPresentationController', () => {
  documentClientMock = createMockInstance(DocumentServiceClient)
  documentRequestBuilderMock = createMockInstance(DocumentRequestBuilder)

  beforeEach(() => {
    controller = new LCPresentationController(
      lcDataAgentMock,
      uploaderMock,
      documentClientMock,
      documentRequestBuilderMock,
      documentService,
      lCPresentationServiceMock,
      lcPresentationReviewServiceMock
    )
  })

  it('LC should be in the Acknowledged state to present a document', async () => {
    lcDataAgentMock.getLC.mockImplementation(() => {
      return {
        _id: '123',
        status: LC_STATE.ISSUED
      }
    })
    lCPresentationServiceMock.getLCPresentationById.mockImplementation(() => {
      return {
        _id: '1'
      }
    })
    uploaderMock.resolveMultipartData.mockResolvedValue({
      data: {
        categoryId: DOCUMENT_CATEGORY.CommercialDocuments
      }
    })
    documentRequestBuilderMock.getPresentationDocumentSearchContext = jest.fn().mockImplementation(() => {
      return {
        productId: DOCUMENT_PRODUCT.TradeFinance,
        presentationId: '1'
      }
    })

    const request = new MockExpressRequest()

    const reply = controller.uploadPresentationDocument('0x123', '1', jwt, request)
    await expect(reply).rejects.toBeInstanceOf(HttpException)
  })

  it('should only allow to present documents in the Trade Documents category', async () => {
    lcDataAgentMock.getLC.mockImplementation(() => {
      return {
        _id: '123',
        status: LC_STATE.ACKNOWLEDGED
      }
    })
    lCPresentationServiceMock.getLCPresentationById.mockImplementation(() => {
      return {
        _id: '1',
        status: LCPresentationStatus.Draft
      }
    })
    uploaderMock.resolveMultipartData.mockResolvedValue({
      data: {
        categoryId: DOCUMENT_CATEGORY.CommercialDocuments
      }
    })

    const request = new MockExpressRequest()

    const reply = controller.uploadPresentationDocument('0x123', '1', jwt, request)
    await expect(reply).rejects.toBeInstanceOf(HttpException)
  })

  it('should only allow to upload documents when presentation is in draft status', async () => {
    lcDataAgentMock.getLC.mockImplementation(() => {
      return {
        _id: '123',
        status: LC_STATE.ACKNOWLEDGED
      }
    })
    lCPresentationServiceMock.getLCPresentationById.mockImplementation(() => {
      return {
        _id: '1',
        status: LCPresentationStatus.DocumentsPresented
      }
    })
    uploaderMock.resolveMultipartData.mockResolvedValue({
      data: {
        categoryId: DOCUMENT_CATEGORY.TradeFinanceDocuments
      }
    })

    const request = new MockExpressRequest()

    const reply = controller.uploadPresentationDocument('0x123', '1', jwt, request)
    await expect(reply).rejects.toBeInstanceOf(HttpException)
  })

  it('should get presentation documents', async () => {
    lCPresentationServiceMock.getLCPresentationDocuments = jest.fn()

    await controller.getPresentationDocuments('1', '1')

    expect(lCPresentationServiceMock.getLCPresentationDocuments).toBeCalled()
  })

  it('should get vakt documents', async () => {
    lcDataAgentMock.getLC.mockImplementation(() => {
      return {
        _id: '123',
        status: LC_STATE.ACKNOWLEDGED,
        tradeAndCargoSnapshot: {
          trade: {
            vaktId: 'vaktId'
          }
        }
      }
    })

    lCPresentationServiceMock.getLCPresentationById.mockImplementation(() => {
      return {
        _id: '1',
        documents: [
          {
            documentId: 'document-1',
            name: 'test-document-1',
            context: {
              presentationId: '1'
            }
          },
          {
            documentId: 'document-2',
            name: 'test-document-2',
            context: {
              presentationId: '2'
            }
          }
        ]
      }
    })

    documentClientMock.getDocuments = jest.fn().mockImplementation(() => {
      return [
        {
          id: 'document-1',
          name: 'test-document-1'
        },
        {
          id: 'document-3',
          name: 'test-document-3'
        }
      ]
    })
    documentRequestBuilderMock.getTradeDocumentContext = jest.fn().mockImplementation(() => {
      return {
        productId: DOCUMENT_PRODUCT.TradeFinance,
        subProductId: 'trade',
        vaktId: '3'
      }
    })
    const result = await controller.getPresentationVaktDocuments('1', '1')
    expect(documentClientMock.getDocuments).toBeCalledWith('tradeFinance', {
      productId: DOCUMENT_PRODUCT.TradeFinance,
      subProductId: 'trade',
      vaktId: '3'
    })
    expect(result).toEqual([
      {
        id: 'document-3',
        name: 'test-document-3'
      }
    ])
  })

  it('should get vakt documents - no vakt documents', async () => {
    lcDataAgentMock.getLC.mockImplementation(() => {
      return {
        _id: '123',
        status: LC_STATE.ACKNOWLEDGED,
        tradeAndCargoSnapshot: {
          trade: {
            vaktId: 'vaktId'
          }
        }
      }
    })

    lCPresentationServiceMock.getLCPresentationById.mockImplementation(() => {
      return {
        _id: '1',
        documents: [
          {
            documentId: 'document-1',
            name: 'test-document-1'
          },
          {
            documentId: 'document-2',
            name: 'test-document-2'
          }
        ]
      }
    })

    documentClientMock.getDocuments = jest.fn().mockImplementation(() => {
      return []
    })
    documentRequestBuilderMock.getTradeDocumentContext = jest.fn().mockImplementation(() => {
      return {
        productId: DOCUMENT_PRODUCT.TradeFinance,
        subProductId: 'trade',
        vaktId: '3'
      }
    })
    const result = await controller.getPresentationVaktDocuments('1', '1')
    expect(documentClientMock.getDocuments).toBeCalledWith('tradeFinance', {
      productId: DOCUMENT_PRODUCT.TradeFinance,
      subProductId: 'trade',
      vaktId: '3'
    })
    expect(result).toEqual([])
  })

  it('should get vakt documents - null vakt documents', async () => {
    lcDataAgentMock.getLC.mockImplementation(() => {
      return {
        _id: '123',
        status: LC_STATE.ACKNOWLEDGED,
        tradeAndCargoSnapshot: {
          trade: {
            vaktId: 'vaktId'
          }
        }
      }
    })

    lCPresentationServiceMock.getLCPresentationById.mockImplementation(() => {
      return {
        _id: '1',
        documents: [
          {
            documentId: 'document-1',
            name: 'test-document-1'
          },
          {
            documentId: 'document-2',
            name: 'test-document-2'
          }
        ]
      }
    })

    documentClientMock.getDocuments = jest.fn().mockImplementation(() => {
      return null
    })
    documentRequestBuilderMock.getTradeDocumentContext = jest.fn().mockImplementation(() => {
      return {
        productId: DOCUMENT_PRODUCT.TradeFinance,
        subProductId: 'trade',
        vaktId: '3'
      }
    })
    const result = await controller.getPresentationVaktDocuments('1', '1')
    expect(documentClientMock.getDocuments).toBeCalledWith('tradeFinance', {
      productId: DOCUMENT_PRODUCT.TradeFinance,
      subProductId: 'trade',
      vaktId: '3'
    })
    expect(result).toEqual([])
  })

  it('should get vakt documents - no presentation documents', async () => {
    lcDataAgentMock.getLC.mockImplementation(() => {
      return {
        _id: '123',
        status: LC_STATE.ACKNOWLEDGED,
        tradeAndCargoSnapshot: {
          trade: {
            vaktId: 'vaktId'
          }
        }
      }
    })

    lCPresentationServiceMock.getLCPresentationById.mockImplementation(() => {
      return {
        _id: '1'
      }
    })

    documentClientMock.getDocuments = jest.fn().mockImplementation(() => {
      return [
        {
          id: 'document-1',
          name: 'test-document-1'
        },
        {
          id: 'document-3',
          name: 'test-document-3'
        }
      ]
    })
    documentRequestBuilderMock.getTradeDocumentContext = jest.fn().mockImplementation(() => {
      return {
        productId: DOCUMENT_PRODUCT.TradeFinance,
        subProductId: 'trade',
        vaktId: '3'
      }
    })
    const result = await controller.getPresentationVaktDocuments('1', '1')
    expect(documentClientMock.getDocuments).toBeCalledWith('tradeFinance', {
      productId: DOCUMENT_PRODUCT.TradeFinance,
      subProductId: 'trade',
      vaktId: '3'
    })
    expect(result).toEqual([
      {
        id: 'document-1',
        name: 'test-document-1'
      },
      {
        id: 'document-3',
        name: 'test-document-3'
      }
    ])
  })

  it('should throw exception vakt documents - trade missing', async () => {
    lcDataAgentMock.getLC.mockImplementation(() => {
      return {
        _id: '123',
        status: LC_STATE.ACKNOWLEDGED
      }
    })

    lCPresentationServiceMock.getLCPresentationById.mockImplementation(() => {
      return {
        _id: '1'
      }
    })

    documentClientMock.getDocuments = jest.fn().mockImplementation(() => {
      return [
        {
          id: 'document-1',
          name: 'test-document-1'
        },
        {
          id: 'document-3',
          name: 'test-document-3'
        }
      ]
    })
    documentRequestBuilderMock.getTradeDocumentContext = jest.fn().mockImplementation(() => {
      return {
        productId: DOCUMENT_PRODUCT.TradeFinance,
        subProductId: 'trade',
        vaktId: '3'
      }
    })
    const reply = controller.getPresentationVaktDocuments('1', '1')
    await expect(reply).rejects.toBeInstanceOf(HttpException)
  })

  it('should be add documents in presentation', async () => {
    lcDataAgentMock.getLC.mockImplementation(() => {
      return {
        _id: '123',
        status: LC_STATE.ACKNOWLEDGED
      }
    })

    lCPresentationServiceMock.getLCPresentationById.mockImplementation(() => {
      return {
        _id: '1',
        status: LCPresentationStatus.Draft
      }
    })

    documentClientMock.getDocumentById = jest.fn().mockImplementation(() => {
      return {
        id: '1',
        hash: 'documentHash',
        type: {
          id: 'documentTypeId'
        },
        registrationDate: '2017-02-02'
      }
    })
    await controller.addDocuments('123', '1', ['1'])
    expect(documentClientMock.getDocumentById).toBeCalledWith('tradeFinance', '1')
  })

  it('should be add vakt document', async () => {
    lcDataAgentMock.getLC.mockImplementation(() => {
      return {
        _id: '123',
        status: LC_STATE.ACKNOWLEDGED,
        tradeAndCargoSnapshot: {
          trade: {
            vaktId: '1'
          }
        }
      }
    })

    lCPresentationServiceMock.getLCPresentationById.mockImplementation(() => {
      return {
        _id: '1',
        status: LCPresentationStatus.Draft,
        reference: '123',
        documents: [
          {
            documentId: '3'
          }
        ]
      }
    })

    documentClientMock.getDocuments = jest
      .fn()
      .mockResolvedValueOnce({
        id: '1',
        hash: 'documentHash',
        type: {
          id: 'documentTypeId'
        },
        registrationDate: '2017-02-02'
      })
      .mockResolvedValueOnce({
        id: '1',
        hash: 'documentHash',
        type: {
          id: 'documentTypeId'
        },
        registrationDate: '2017-02-02',
        context: {
          presentationId: '234'
        }
      })
    await controller.addDocuments('123', '1', ['1'])
    expect(documentClientMock.getDocumentById).toBeCalledWith('tradeFinance', '1')
  })

  it('should be wrong lc status', async () => {
    lcDataAgentMock.getLC.mockImplementation(() => {
      return {
        _id: '123',
        status: LC_STATE.ISSUED
      }
    })
    const result = controller.addDocuments('123', '1', ['1', '2'])
    await expect(result).rejects.toBeInstanceOf(HttpException)
  })
  it('should be wrong presentation status', async () => {
    lcDataAgentMock.getLC.mockImplementation(() => {
      return {
        _id: '123',
        status: LC_STATE.ACKNOWLEDGED
      }
    })

    lCPresentationServiceMock.getLCPresentationById.mockImplementation(() => {
      return {
        _id: '1',
        status: LCPresentationStatus.DocumentsPresented
      }
    })
    const result = controller.addDocuments('123', '1', ['1'])
    await expect(result).rejects.toBeInstanceOf(HttpException)
  })

  it('should be throw exception', async () => {
    lcDataAgentMock.getLC.mockImplementation(() => {
      return {
        _id: '123',
        status: LC_STATE.ACKNOWLEDGED
      }
    })

    lCPresentationServiceMock.getLCPresentationById.mockImplementation(() => {
      return {
        _id: '1',
        status: LCPresentationStatus.Draft
      }
    })

    documentClientMock.getDocumentById = jest.fn().mockImplementation(() => {
      throw new MicroserviceConnectionException('Not found document')
    })

    const result = controller.addDocuments('123', '1', ['1'])
    await expect(result).rejects.toBeInstanceOf(HttpException)
  })

  it('LC should be in the Acknowledged state to present a mark compliant', async () => {
    lcDataAgentMock.getLC.mockImplementation(() => {
      return {
        _id: '123',
        status: LC_STATE.ISSUED
      }
    })
    lCPresentationServiceMock.getLCPresentationById.mockImplementation(() => {
      return {
        _id: '1'
      }
    })

    const reply = controller.markCompliant('0x123', '1')
    await expect(reply).rejects.toBeInstanceOf(HttpException)
  })

  it('Mark compliant', async () => {
    lcDataAgentMock.getLC.mockImplementation(() => {
      return {
        _id: '123',
        status: LC_STATE.ACKNOWLEDGED
      }
    })
    lCPresentationServiceMock.getLCPresentationById.mockImplementation(() => {
      return {
        _id: '1'
      }
    })

    await controller.markCompliant('0x123', '1')
    expect(lcPresentationReviewServiceMock.markCompliant).toBeCalled()
  })

  it('Should be delete LC Presentation by presentation id', async () => {
    controller.deletePresentationById('1')
    expect(lCPresentationServiceMock.deletePresentationById).toBeCalled()
  })

  it('Should be delete LC Presentation document', async () => {
    const presentationId = '1'
    const documentId = '1'
    controller.deletePresentationDocument(presentationId, documentId)
    expect(lCPresentationServiceMock.deletePresentationDocument).toBeCalled()
  })

  it('Should be add Presentation', async () => {
    lcDataAgentMock.getLC.mockImplementation(() => {
      return {
        _id: '123',
        status: LC_STATE.ACKNOWLEDGED,
        reference: '123'
      }
    })

    await controller.addPresentation('123')
    expect(lCPresentationServiceMock.createNewPresentation).toBeCalled()
  })

  it('Should be can not delete presentaion by id', async () => {
    lCPresentationServiceMock.deletePresentationById.mockImplementation(() => {
      throw new MicroserviceConnectionException(`Failed to delete LC presentation with id : 1`)
    })

    const result = controller.deletePresentationById('1')
    await expect(result).rejects.toBeInstanceOf(HttpException)
  })

  it('Should be throw internal server error deletepresentaionby Id', async () => {
    lCPresentationServiceMock.deletePresentationById.mockImplementation(() => {
      throw Error(`Failed to delete LC presentation with id : 1`)
    })

    const result = controller.deletePresentationById('1')
    await expect(result).rejects.toBeInstanceOf(HttpException)
  })

  it('Should be not found presentaion document', async () => {
    lCPresentationServiceMock.deletePresentationDocument.mockImplementation(() => {
      throw new InvalidOperationException(`Not found document`)
    })

    const result = controller.deletePresentationDocument('1', '1')
    await expect(result).rejects.toBeInstanceOf(HttpException)
  })

  it('Should be failed delete presentaion documents', async () => {
    lCPresentationServiceMock.deletePresentationDocument.mockImplementation(() => {
      throw new InvalidOperationException(`Failed to delete presentation document with id : 1`)
    })

    const result = controller.deletePresentationDocument('1', '1')
    await expect(result).rejects.toBeInstanceOf(HttpException)
  })

  it('Should be throw internal server error deletepresentaionby Id', async () => {
    lCPresentationServiceMock.deletePresentationDocument.mockImplementation(() => {
      throw Error(`Failed to delete presentation document with id : 1`)
    })

    const result = controller.deletePresentationDocument('1', '1')
    await expect(result).rejects.toBeInstanceOf(HttpException)
  })

  it('Should be submit presentation', async () => {
    lCPresentationServiceMock.getLCPresentationById.mockImplementation(() => {
      return {
        _id: 1
      }
    })
    lcDataAgentMock.getLC.mockImplementation(() => {
      return {
        _id: '1'
      }
    })

    lCPresentationServiceMock.submitPresentation.mockImplementation(() => {
      return { txHash: 'test' }
    })

    await controller.submitPresentation('1', { comment: 'test' })
    expect(lCPresentationServiceMock.submitPresentation).toBeCalled()
  })

  it('Should be can not submit presentation', async () => {
    lCPresentationServiceMock.getLCPresentationById.mockImplementation(() => {
      return null
    })

    const result = controller.submitPresentation('1', { comment: 'test' })
    await expect(result).rejects.toBeInstanceOf(HttpException)
  })

  describe('received-documents', () => {
    it('should return received documents for review', async () => {
      const response = { requestId: '1' }
      lCPresentationServiceMock.getLCPresentationById.mockImplementation(() => {
        return {
          _id: 1
        }
      })
      lcPresentationReviewServiceMock.getReceivedDocuments.mockReturnValueOnce(response)
      const result = await controller.getPresentationDocumentReview('lcid', 'lcpresid')

      expect(result).toMatchObject(response)
    })

    it('should return 404 if documents for review not found', async () => {
      lcPresentationReviewServiceMock.getReceivedDocuments.mockReturnValueOnce(null)
      const action = controller.getPresentationDocumentReview('lcid', 'lcpresid')

      expect(action).rejects.toBeInstanceOf(HttpException)
    })
  })

  describe('documents-feedback', () => {
    it('should return received documents for review', async () => {
      const response = { requestId: '1' }
      lcPresentationReviewServiceMock.getDocumentsFeedback.mockReturnValueOnce(response)
      const result = await controller.getPresentationFeedback('lcid', 'lcpresid')

      expect(result).toMatchObject(response)
    })

    it('should throw lc not found', async () => {
      lcDataAgentMock.getLC.mockReturnValueOnce(null)
      const result = controller.getPresentationFeedback('123', '1')
      await expect(result).rejects.toBeInstanceOf(HttpException)
    })

    it('should throw lc presentation not found', async () => {
      lCPresentationServiceMock.getLCPresentationById.mockReturnValueOnce(null)
      const result = controller.getPresentationFeedback('123', '1')
      await expect(result).rejects.toBeInstanceOf(HttpException)
    })
  })
})
