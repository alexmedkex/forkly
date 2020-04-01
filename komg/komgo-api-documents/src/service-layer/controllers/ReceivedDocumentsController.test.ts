import 'reflect-metadata'

import { ReceivedDocumentsService } from '../../business-layer/services/ReceivedDocumentsService'
import ItemNotFound from '../../data-layer/data-agents/exceptions/ItemNotFound'
import ProductDataAgent from '../../data-layer/data-agents/ProductDataAgent'
import ReceivedDocumentsDataAgent from '../../data-layer/data-agents/ReceivedDocumentsDataAgent'
import {
  fullReceivedDocuments,
  PRODUCT_ID,
  RECEIVED_DOCUMENTS_ID,
  receivedDocuments,
  receivedDocumentsArrayWithRequestId,
  product
} from '../../data-layer/models/test-entities'
import { mock } from '../../mock-utils'
import { IReceivedDocumentsAggregationResponse } from '../responses/received-documents'
import * as TestResponses from '../utils/test-entities'

import { ReceivedDocumentsController } from './ReceivedDocumentsController'
import { expectError } from './test-utils'
import ControllerUtils from './utils'

const receivedDocumentsService = mock(ReceivedDocumentsService)
const receivedDocumentsDataAgent = mock(ReceivedDocumentsDataAgent)
const productDataAgent = mock(ProductDataAgent)

describe('ReceivedDocumentsController', () => {
  let controller

  beforeEach(() => {
    jest.resetAllMocks()
    const controllerUtils = new ControllerUtils(productDataAgent, null, null, null)
    controller = new ReceivedDocumentsController(receivedDocumentsService, controllerUtils)
    productDataAgent.getAll.mockReturnValue([product()])
  })

  it('returns a single incoming request by id', async () => {
    receivedDocumentsService.getById.mockReturnValue(fullReceivedDocuments())

    const request = await controller.GetReceivedDocumentsById(PRODUCT_ID, RECEIVED_DOCUMENTS_ID)
    expect(request).toEqual(TestResponses.fullReceivedDocuments())
    expect(receivedDocumentsService.getById).toBeCalledWith(PRODUCT_ID, RECEIVED_DOCUMENTS_ID)
  })

  it('throw an error if item does not exist', async () => {
    receivedDocumentsService.getById.mockReturnValue(null)
    const call = controller.GetReceivedDocumentsById(PRODUCT_ID, RECEIVED_DOCUMENTS_ID)

    await expectError(404, 'Received documents not found', call)
  })

  it('returns all incoming requests by product id', async () => {
    receivedDocumentsService.getAllWithContext.mockReturnValue([fullReceivedDocuments()])

    const request = await controller.GetReceivedDocumentsByProduct(PRODUCT_ID)
    expect(request).toEqual([TestResponses.fullReceivedDocuments()])
    expect(receivedDocumentsService.getAllWithContext).toBeCalledWith(PRODUCT_ID, undefined)
  })

  it('throw an error if context filter is not in correct format', async () => {
    const call = controller.GetReceivedDocumentsByProduct(PRODUCT_ID, '{badjson:1}')
    await expectError(422, 'context is not in correct format', call)
  })

  it('updates status of documents by receivedDocumentsId', async () => {
    const documents = receivedDocuments()
    receivedDocumentsDataAgent.getById.mockReturnValue(fullReceivedDocuments())
    receivedDocumentsService.updateDocumentsStatus.mockReturnValue(documents)

    const request = await controller.UpdateDocumentStatus(
      PRODUCT_ID,
      RECEIVED_DOCUMENTS_ID,
      TestResponses.documentsReviewUpdate()
    )
    const { shareId, ...expectedResult } = documents
    expect(request).toEqual(expectedResult)
  })

  it('updates status of documents by requestId', async () => {
    const documentsArray = receivedDocumentsArrayWithRequestId()
    receivedDocumentsService.updateDocumentsStatusByRequestId.mockReturnValue(documentsArray)

    const request: IReceivedDocumentsAggregationResponse = await controller.UpdateDocumentStatusByRequestId(
      PRODUCT_ID,
      TestResponses.REQUEST_ID,
      TestResponses.documentsReviewUpdate()
    )

    const expectedResult: IReceivedDocumentsAggregationResponse = TestResponses.receivedDocumentsAggregation()

    expect(request).toEqual(expectedResult)
  })

  it('sends document feedback', async () => {
    receivedDocumentsService.sendFeedback.mockReturnValue(undefined)

    const request = await controller.SendFeedback(PRODUCT_ID, RECEIVED_DOCUMENTS_ID)
    expect(request).toEqual(undefined)
    expect(receivedDocumentsService.sendFeedback).toBeCalledWith(PRODUCT_ID, RECEIVED_DOCUMENTS_ID)
  })

  it('throws an error if productID isnt passed', async () => {
    receivedDocumentsService.sendFeedback.mockReturnValue(undefined)

    const request = controller.SendFeedback(null, RECEIVED_DOCUMENTS_ID)
    await expectError(422, 'Invalid product id', request)
  })

  it('throws a 404 if Received Documents are not found', async () => {
    receivedDocumentsService.sendFeedback.mockRejectedValue(new ItemNotFound('Received Documents ID not found'))

    const request = controller.SendFeedback(PRODUCT_ID, 'non-existent-id')
    await expectError(404, 'Received Documents ID not found', request)
  })
})
