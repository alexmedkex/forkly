import { ErrorCode } from '@komgo/error-utilities'
import { ErrorUtils, HttpException } from '@komgo/microservice-config'
import { Controller, Get, Path, Route, Security, Tags, Response, Post, Body, Patch } from 'tsoa'

import { IncomingRequestService } from '../../business-layer/services/IncomingRequestService'
import IncomingRequestDataAgent from '../../data-layer/data-agents/IncomingRequestDataAgent'
import { IIncomingRequest } from '../../data-layer/models/incoming-request'
import { inject, provideSingleton } from '../../inversify/ioc'
import { TYPES } from '../../inversify/types'
import { DismissTypeRequest } from '../request/incoming-request'
import { Note } from '../request/outgoing-request/Note'
import { convertFullIncomingRequest } from '../responses/converters'
import { IFullIncomingRequestResponse } from '../responses/incoming-request/IFullIncomingRequestResponse'

import ControllerUtils from './utils'

@Tags('Incoming Requests')
@Route('products')
@provideSingleton(IncomingRequestsController)
export class IncomingRequestsController extends Controller {
  constructor(
    @inject(TYPES.IncomingRequestService) private readonly incomingRequestService: IncomingRequestService,
    @inject(TYPES.ControllerUtils) private readonly controllerUtils: ControllerUtils,
    @inject(TYPES.IncomingRequestDataAgent) private readonly incomingRequestDataAgent: IncomingRequestDataAgent
  ) {
    super()
  }

  /**
   * Retrieve a specific incoming request. Example: a document request sent by counterparty to this company
   * @param productId Identifier of the product (e.g.: kyc, tradeFinance...)
   * @param requestId Identifier for incoming request
   */
  @Response<HttpException>('404', 'Incoming request does not exist')
  @Response<HttpException>('422', 'Product ID does not exist')
  @Security('withPermission', ['kyc', 'manageDoc', 'read'])
  @Get('{productId}/incoming-requests/{requestId}')
  public async GetRequestById(
    @Path('productId') productId: string,
    @Path('requestId') requestId: string
  ): Promise<IFullIncomingRequestResponse> {
    // throws 422 if product ID is unknown
    await this.controllerUtils.validateProductId(productId)
    const request = await this.incomingRequestService.getById(productId, requestId)
    if (request != null) {
      return convertFullIncomingRequest(request)
    } else {
      throw ErrorUtils.notFoundException(ErrorCode.ValidationHttpContent, 'Request not found')
    }
  }

  /**
   * Dismiss type from a specific incoming request
   * @param productId Identifier of the product (e.g.: kyc, tradeFinance...)
   * @param requestId Identifier for incoming request
   * @param req Object with the content of the dismissal
   */
  @Response<HttpException>('404', 'Incoming request does not exist')
  @Response<HttpException>('422', 'Product ID or Request ID does not exist')
  @Security('withPermission', ['kyc', 'manageDoc', 'read'])
  @Patch('{productId}/incoming-requests/{requestId}/dismiss-type')
  public async DismissDocumentType(
    @Path('productId') productId: string,
    @Path('requestId') requestId: string,
    @Body() req: DismissTypeRequest
  ): Promise<IFullIncomingRequestResponse> {
    await this.controllerUtils.validateProductId(productId)
    await this.controllerUtils.validateRequestId(productId, requestId)
    await this.controllerUtils.validateTypeId(productId, req.typeId)

    const updated = await this.incomingRequestDataAgent.dismissDocumentType(productId, requestId, req)
    return convertFullIncomingRequest(updated)
  }

  /**
   * Retrieve all incoming requests
   * @param productId Identifier of the product (e.g.: kyc, tradeFinance...)
   */
  @Response<HttpException>('422', 'Product ID does not exist')
  @Security('withPermission', ['kyc', 'manageDoc', 'read'])
  @Get('{productId}/incoming-requests')
  public async GetRequestsByProduct(@Path('productId') productId: string): Promise<IFullIncomingRequestResponse[]> {
    await this.controllerUtils.validateProductId(productId)
    const requests = await this.incomingRequestService.getAllByProduct(productId)
    return requests.map(template => convertFullIncomingRequest(template))
  }

  /**
   * Send note
   * @param productId Identifier of the product (e.g.: kyc, tradeFinance...)
   * @param requestId Identifier of the incoming request
   * @param note Object with the content of the note
   */
  @Response<HttpException>('422', 'Product ID or Request ID do not exist')
  @Security('withPermission', ['kyc', 'manageDoc', 'read'])
  @Post('{productId}/incoming-requests/{requestId}/note')
  public async SendNote(
    @Path('productId') productId: string,
    @Path('requestId') requestId: string,
    @Body() note: Note
  ): Promise<void> {
    await this.controllerUtils.validateProductId(productId)
    const request: IIncomingRequest = await this.controllerUtils.validateRequestId(productId, requestId)

    await this.incomingRequestService.sendNote(productId, request, note)
  }
}
