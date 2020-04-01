import 'reflect-metadata'

import { HttpException } from '@komgo/microservice-config'

import { IncomingRequestService } from '../../business-layer/services/IncomingRequestService'
import { SendDocumentsService } from '../../business-layer/services/SendDocumentsService'
import ProductDataAgent from '../../data-layer/data-agents/ProductDataAgent'
import SharedDocumentsDataAgent from '../../data-layer/data-agents/SharedDocumentsDataAgent'
import {
  COMPANY_ID,
  document,
  DOCUMENT_ID,
  REQUEST_ID,
  fullSharedDocuments,
  product,
  INCOMING_REQUEST_ID,
  incomingRequest
} from '../../data-layer/models/test-entities'
import { mock } from '../../mock-utils'
import { documentResponse, SUBPRODUCT_ID, PRODUCT_ID, fullSharedDocumentsResponse } from '../utils/test-entities'

import { SendDocumentsController } from './SendDocumentsController'
import ControllerUtils from './utils'
import { IAPIError } from '@komgo/microservice-config/dist/errors/IAPIError'

const sendDocumentsService = mock(SendDocumentsService)
const shareDocumentsDataAgent = mock(SharedDocumentsDataAgent)

const documentsRequest = {
  documents: [DOCUMENT_ID],
  companyId: COMPANY_ID,
  requestId: REQUEST_ID,
  context: { subProductId: SUBPRODUCT_ID }
}

const documentsRequestNoReview = {
  ...documentsRequest,
  reviewNotRequired: true
}

const productDataAgent = mock(ProductDataAgent)
const incomingRequestService = mock(IncomingRequestService)

describe('SendDocumentsController', () => {
  let controller: SendDocumentsController

  beforeEach(() => {
    jest.resetAllMocks()
    const controllerUtils = new ControllerUtils(productDataAgent, null, null, incomingRequestService)
    controller = new SendDocumentsController(sendDocumentsService, shareDocumentsDataAgent, controllerUtils)
    productDataAgent.getAll.mockReturnValue([product()])
  })

  it('CreateResponse', async () => {
    sendDocumentsService.sendDocuments.mockResolvedValue([document()])
    const res = await controller.SendDocuments(PRODUCT_ID, documentsRequest)
    expect(res).toEqual([documentResponse()])
  })

  it('CreateResponse with ', async () => {
    sendDocumentsService.sendDocuments.mockResolvedValue([document()])
    const res = await controller.SendDocuments(PRODUCT_ID, documentsRequest)
    expect(res).toEqual([documentResponse()])
  })

  it('CreateResponse from request with no context', async () => {
    const request = {
      ...documentsRequestNoReview,
      context: undefined
    }

    sendDocumentsService.sendDocuments.mockResolvedValue([document()])
    const res = await controller.SendDocuments(PRODUCT_ID, request)
    expect(res).toEqual([documentResponse()])
  })

  it('fails to send documents', async () => {
    const httpError: IAPIError = {
      message: 'error',
      errorCode: 'customError',
      origin: 'api-documents'
    }

    sendDocumentsService.sendDocuments.mockImplementationOnce(() => {
      throw new HttpException(500, httpError)
    })

    try {
      await controller.SendDocuments(PRODUCT_ID, documentsRequest)
    } catch (e) {
      expect(e).toBeDefined()
    }
  })

  it('fails when sending documents with internal endpoint', async () => {
    sendDocumentsService.sendDocuments.mockRejectedValue(new Error())

    let errorToExpect
    try {
      await controller.SendDocumentsInternal(PRODUCT_ID, documentsRequestNoReview)
    } catch (error) {
      errorToExpect = error
    } finally {
      expect(errorToExpect).toBeInstanceOf(HttpException)
    }
  })

  it('get shared documents', async () => {
    shareDocumentsDataAgent.getAllWithContext.mockReturnValue([fullSharedDocuments()])
    const res = await controller.GetSendDocumentsByProduct(PRODUCT_ID, null)
    expect(res).toEqual([fullSharedDocumentsResponse()])
    expect(shareDocumentsDataAgent.getAllWithContext).toBeCalledWith(PRODUCT_ID, undefined)
  })

  it('get shared documents by requestId', async () => {
    incomingRequestService.getBareById.mockReturnValue(incomingRequest())
    shareDocumentsDataAgent.getAllByRequestId.mockReturnValue([fullSharedDocuments()])
    const res = await controller.GetSendDocumentsByRequestId(PRODUCT_ID, INCOMING_REQUEST_ID)
    expect(res).toEqual([fullSharedDocumentsResponse()])
    expect(shareDocumentsDataAgent.getAllByRequestId).toBeCalledWith(PRODUCT_ID, INCOMING_REQUEST_ID)
  })
})
