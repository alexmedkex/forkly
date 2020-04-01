import 'reflect-metadata'

import { IncomingRequestService } from '../../business-layer/services/IncomingRequestService'
import {
  incomingRequest,
  fullIncomingRequest,
  INCOMING_REQUEST_ID,
  PRODUCT_ID,
  REQUEST_ID,
  product,
  type,
  TYPE_ID,
  incomingRequestComplete
} from '../../data-layer/models/test-entities'
import ProductDataAgent from '../../data-layer/data-agents/ProductDataAgent'
import { mock } from '../../mock-utils'
import * as ControllerTestEntities from '../utils/test-entities'

import { IncomingRequestsController } from './IncomingRequestsController'
import { expectError } from './test-utils'
import ControllerUtils from './utils'
import IncomingRequestDataAgent from '../../data-layer/data-agents/IncomingRequestDataAgent'
import { DismissTypeRequest } from '../request/incoming-request'
import TypeDataAgent from '../../data-layer/data-agents/TypeDataAgent'

const incomingRequestService = mock(IncomingRequestService)
const productDataAgent = mock(ProductDataAgent)
const typeDataAgent = mock(TypeDataAgent)
const incomingRequestDataAgent = mock(IncomingRequestDataAgent)

describe('IncomingRequestsController', () => {
  let controller

  beforeEach(() => {
    jest.resetAllMocks()
    const controllerUtils = new ControllerUtils(productDataAgent, typeDataAgent, null, incomingRequestService)
    controller = new IncomingRequestsController(incomingRequestService, controllerUtils, incomingRequestDataAgent)
    productDataAgent.getAll.mockReturnValue([product()])
    typeDataAgent.getAllByProduct.mockResolvedValue([type()])
  })

  it('returns a single incoming request by id', async () => {
    incomingRequestService.getById.mockReturnValue(fullIncomingRequest())

    const request = await controller.GetRequestById(PRODUCT_ID, INCOMING_REQUEST_ID)
    expect(request).toEqual(ControllerTestEntities.fullIncomingRequest())
    expect(incomingRequestService.getById).toBeCalledWith(PRODUCT_ID, INCOMING_REQUEST_ID)
  })

  it('throw an error if item does not exist', async () => {
    incomingRequestService.getById.mockReturnValue(null)
    const call = controller.GetRequestById(PRODUCT_ID, INCOMING_REQUEST_ID)

    await expectError(404, 'Request not found', call)
  })

  it('returns all incoming requests by product id', async () => {
    incomingRequestService.getAllByProduct.mockResolvedValue([fullIncomingRequest()])

    const request = await controller.GetRequestsByProduct(PRODUCT_ID)
    expect(request).toEqual([ControllerTestEntities.fullIncomingRequest()])
    expect(incomingRequestService.getAllByProduct).toBeCalledWith(PRODUCT_ID)
  })

  it('sends a note', async () => {
    incomingRequestService.getBareById.mockReturnValue(incomingRequest())

    const request = await controller.SendNote(
      PRODUCT_ID,
      INCOMING_REQUEST_ID,
      ControllerTestEntities.NOTE_FROM_CONTROLLER
    )
    expect(incomingRequestService.sendNote).toBeCalledWith(
      PRODUCT_ID,
      incomingRequest(),
      ControllerTestEntities.NOTE_FROM_CONTROLLER
    )
  })

  it('tries to send a note but fails due to null requestId', async () => {
    incomingRequestService.getBareById.mockReturnValue(null)

    const call = controller.SendNote(PRODUCT_ID, INCOMING_REQUEST_ID, ControllerTestEntities.NOTE_FROM_CONTROLLER)
    await expectError(
      422,
      `Incoming request not found for productId ${PRODUCT_ID} and requestId ${INCOMING_REQUEST_ID}`,
      call
    )
  })

  it('returns updated request with dismissed type', async () => {
    const dismissType: DismissTypeRequest = {
      content: 'bla bla',
      date: new Date(),
      typeId: TYPE_ID
    }

    incomingRequestService.getBareById.mockReturnValue(incomingRequest())
    incomingRequestDataAgent.dismissDocumentType.mockReturnValue({
      ...fullIncomingRequest(),
      dismissedTypes: [dismissType]
    })

    const request = await controller.DismissDocumentType(PRODUCT_ID, REQUEST_ID, dismissType)
    expect(request.dismissedTypes).toEqual([dismissType])
  })

  it('fails if request not found for a dismissed type', async () => {
    const dismissType: DismissTypeRequest = {
      content: 'bla bla',
      date: new Date(),
      typeId: TYPE_ID
    }

    incomingRequestService.getBareById.mockReturnValue(undefined)

    const call = controller.DismissDocumentType(PRODUCT_ID, REQUEST_ID, dismissType)
    await expectError(422, `Incoming request not found for productId ${PRODUCT_ID} and requestId ${REQUEST_ID}`, call)
  })
})
