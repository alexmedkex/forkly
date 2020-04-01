import 'reflect-metadata'

import { RequestService } from '../../business-layer/services/RequestService'
import OutgoingRequestDataAgent from '../../data-layer/data-agents/OutgoingRequestDataAgent'
import ProductDataAgent from '../../data-layer/data-agents/ProductDataAgent'
import TypeDataAgent from '../../data-layer/data-agents/TypeDataAgent'
import {
  fullOutgoingRequest,
  fullType,
  PRODUCT_ID,
  outgoingRequest,
  REQUEST_ID,
  TYPE_ID,
  product,
  COMPANY_ID
} from '../../data-layer/models/test-entities'
import { mock } from '../../mock-utils'
import { deepCopy } from '../../utils'
import { IOutgoingRequestResponse } from '../responses/request'
import { NOTE_FROM_CONTROLLER } from '../utils/test-entities'

import { OutgoingRequestsController } from './OutgoingRequestsController'
import { expectError } from './test-utils'
import ControllerUtils from './utils'

const bareRequestResponse = {
  id: REQUEST_ID,
  productId: PRODUCT_ID,
  companyId: 'company-id',
  types: [TYPE_ID]
}

const requestService = mock(RequestService)
const requestDataAgent = mock(OutgoingRequestDataAgent)
const productDataAgent = mock(ProductDataAgent)
const typeDataAgent = mock(TypeDataAgent)

describe('OutgoingRequestController', () => {
  let controller

  beforeEach(() => {
    const controllerUtils = new ControllerUtils(productDataAgent, typeDataAgent, null, null)
    controller = new OutgoingRequestsController(COMPANY_ID, requestService, requestDataAgent, controllerUtils)
    jest.resetAllMocks()
    typeDataAgent.getById.mockReturnValue(fullType())
    productDataAgent.getAll.mockReturnValue([product()])
  })

  it('get request by id', async () => {
    requestDataAgent.getById.mockReturnValue(fullOutgoingRequest())

    const result = await controller.GetRequestById(PRODUCT_ID, REQUEST_ID)
    expect(result).toEqual(fullOutgoingRequest())
    expect(requestDataAgent.getById).toBeCalledWith(PRODUCT_ID, REQUEST_ID)
  })

  it('throws an exception if the request id is not found', async () => {
    requestDataAgent.getById.mockReturnValue(null)

    await expectError(404, 'Request not found', controller.GetRequestById(PRODUCT_ID, REQUEST_ID))
    expect(requestDataAgent.getById).toBeCalledWith(PRODUCT_ID, REQUEST_ID)
  })

  it('throws an exception if the request id is null', async () => {
    requestDataAgent.getById.mockReturnValue(null)

    await expectError(404, 'Request not found', controller.GetRequestById(PRODUCT_ID, null))
  })

  it('get request by product id', async () => {
    requestDataAgent.getAllByProduct.mockReturnValue([fullOutgoingRequest()])

    const result = await controller.GetRequestsByProduct(PRODUCT_ID)
    expect(result).toEqual([fullOutgoingRequest()])
    expect(requestDataAgent.getAllByProduct).toBeCalledWith(PRODUCT_ID)
  })

  it('throws an exception if the product id is null', async () => {
    requestDataAgent.getAllByProduct.mockReturnValue(null)

    await expectError(422, 'Invalid product id', controller.GetRequestsByProduct(null))
  })

  it('it creates a request', async () => {
    const createRequest = deepCopy(bareRequestResponse)
    delete createRequest.id

    const newRequest = outgoingRequest()
    newRequest.id = undefined
    newRequest.forms = undefined
    newRequest.notes = []

    requestService.sendDocumentRequest.mockReturnValue(outgoingRequest())

    const result: IOutgoingRequestResponse = await controller.CreateRequest(PRODUCT_ID, createRequest)
    expect(result).toEqual(bareRequestResponse)
    expect(requestService.sendDocumentRequest).toBeCalledWith(PRODUCT_ID, newRequest)
  })

  it('throws an exception if a type with the specified id does not exist', async () => {
    typeDataAgent.getById.mockReturnValue(null)

    const result: Promise<IOutgoingRequestResponse> = controller.CreateRequest(PRODUCT_ID, outgoingRequest())
    await expectError(422, `Type with id '${TYPE_ID}' does not exist`, result)
  })

  it('sends a note', async () => {
    requestDataAgent.getById.mockReturnValue(fullOutgoingRequest())

    const request = await controller.SendNote(PRODUCT_ID, REQUEST_ID, NOTE_FROM_CONTROLLER)
    expect(requestService.sendNote).toBeCalledWith(PRODUCT_ID, fullOutgoingRequest(), NOTE_FROM_CONTROLLER)
  })

  it('tries to send a note but fails due to null requestId', async () => {
    requestDataAgent.getById.mockReturnValue(null)

    const call = controller.SendNote(PRODUCT_ID, REQUEST_ID, NOTE_FROM_CONTROLLER)
    await expectError(422, `Outgoing request not found for productId ${PRODUCT_ID} and requestId ${REQUEST_ID}`, call)
  })
})
