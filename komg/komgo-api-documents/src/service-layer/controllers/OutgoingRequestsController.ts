import { ErrorCode } from '@komgo/error-utilities'
import { validateRequest, ErrorUtils, HttpException } from '@komgo/microservice-config'
import { Body, Controller, Get, Path, Post, Route, Security, Tags, Response } from 'tsoa'

import { RequestService } from '../../business-layer/services/RequestService'
import OutgoingRequestDataAgent from '../../data-layer/data-agents/OutgoingRequestDataAgent'
import { IOutgoingRequest, IFullOutgoingRequest } from '../../data-layer/models/outgoing-request'
import { INote } from '../../data-layer/models/requests/INote'
import { MeterOutcome } from '../../infrastructure/metrics/metrics'
import { CONFIG_KEYS } from '../../inversify/config_keys'
import { inject, provideSingleton } from '../../inversify/ioc'
import { TYPES } from '../../inversify/types'
import { IClassType } from '../../utils'
import { CreateOutgoingRequestRequest } from '../request/outgoing-request'
import { Note } from '../request/outgoing-request/Note'
import { convertFullRequest, convertRequest } from '../responses/converters'
import { IOutgoingRequestResponse } from '../responses/request'
import { IFullOutgoingRequestResponse } from '../responses/request/IFullRequestResponse'

import ControllerUtils from './utils'

/**
 * Outgoing requests controller.
 */
@Tags('Outgoing requests')
@Route('products')
@provideSingleton(OutgoingRequestsController)
export class OutgoingRequestsController extends Controller {
  constructor(
    @inject(CONFIG_KEYS.CompanyStaticId) private readonly companyStaticId: string,
    @inject(TYPES.RequestService) private readonly requestService: RequestService,
    @inject(TYPES.OutgoingRequestDataAgent) private readonly requestDataAgent: OutgoingRequestDataAgent,
    @inject(TYPES.ControllerUtils) private readonly controllerUtils: ControllerUtils
  ) {
    super()
  }

  /**
   * Send a request to a counterparty (outgoing request). Example: a document request to a counterparty
   * @param productId Identifier of the product (e.g.: kyc, tradeFinance...)
   * @param newRequest Request document types to a counterparty
   */
  @MeterOutcome('documentsSharedOutcome')
  @Response<HttpException>('422', 'Request values may not exist - unknown type or product id')
  @Security('withPermission', ['kyc', 'requestDoc', 'readRequest'])
  @Post('{productId}/outgoing-requests')
  public async CreateRequest(
    @Path('productId') productId: string,
    @Body() newRequest: CreateOutgoingRequestRequest
  ): Promise<IOutgoingRequestResponse> {
    // throws 422 if product ID is unknown
    await this.validateRequest(productId, CreateOutgoingRequestRequest, newRequest)

    try {
      const request = await this.requestService.sendDocumentRequest(
        productId,
        this.convertToModel(productId, newRequest)
      )
      return convertRequest(request)
    } catch (error) {
      // may throw 404 if entity was not found
      // may throw 409 if entity is duplicated
      // may throw 422 if entity was considered invalid
      this.controllerUtils.processDataLayerException(error)
    }
  }

  /**
   * Retrieve a specific outgoing request. Example: a document request to a counterparty
   * @param productId Identifier of the product (e.g.: kyc, tradeFinance...)
   * @param requestId Identifier for outgoing request
   */
  @Response<HttpException>('404', 'Outgoing request does not exist')
  @Response<HttpException>('422', 'Product ID does not exist')
  @Security('withPermission', ['kyc', 'requestDoc', 'read'])
  @Get('{productId}/outgoing-requests/{requestId}')
  public async GetRequestById(
    @Path('productId') productId: string,
    @Path('requestId') requestId: string
  ): Promise<IFullOutgoingRequestResponse> {
    // throws 422 if product ID is unknown
    await this.controllerUtils.validateProductId(productId)
    const request = await this.requestDataAgent.getById(productId, requestId)
    if (request != null) {
      return convertFullRequest(request)
    } else {
      throw ErrorUtils.notFoundException(ErrorCode.ValidationHttpContent, 'Request not found')
    }
  }

  /**
   * Retrieve all outgoing requests
   * @param productId Identifier of the product (e.g.: kyc, tradeFinance...)
   */
  @Response<HttpException>('422', 'Product ID does not exist')
  @Security('withPermission', ['kyc', 'requestDoc', 'read'])
  @Get('{productId}/outgoing-requests')
  public async GetRequestsByProduct(@Path('productId') productId: string): Promise<IFullOutgoingRequestResponse[]> {
    // throws 422 if product ID is unknown
    await this.controllerUtils.validateProductId(productId)
    const requests = await this.requestDataAgent.getAllByProduct(productId)
    return requests.map(template => convertFullRequest(template))
  }

  /**
   * Send note
   * @param productId Identifier of the product (e.g.: kyc, tradeFinance...)
   */
  @Response<HttpException>('422', 'Product ID or Request ID do not exist')
  @Security('withPermission', ['kyc', 'requestDoc', 'readRequest'])
  @Post('{productId}/outgoing-requests/{requestId}/note')
  public async SendNote(
    @Path('productId') productId: string,
    @Path('requestId') requestId: string,
    @Body() note: Note
  ): Promise<void> {
    // throws 422 if product ID is unknown
    await this.controllerUtils.validateProductId(productId)
    const request: IFullOutgoingRequest = await this.requestDataAgent.getById(productId, requestId)
    if (!request) {
      throw ErrorUtils.unprocessableEntityException(
        ErrorCode.ValidationHttpContent,
        `Outgoing request not found for productId ${productId} and requestId ${requestId}`
      )
    }
    await this.requestService.sendNote(productId, request, note)
  }

  private async validateRequest(
    productId: string,
    type: IClassType<CreateOutgoingRequestRequest>,
    request: CreateOutgoingRequestRequest
  ) {
    await this.controllerUtils.validateProductId(productId)
    await validateRequest(type, request)
    await this.controllerUtils.validateDefaultTypes(productId, request.types)
  }

  private convertToModel(productId: string, newRequest: CreateOutgoingRequestRequest): IOutgoingRequest {
    const notes: INote[] = (newRequest.notes || []).map(note => {
      return {
        date: note.date,
        sender: this.companyStaticId,
        content: note.content
      }
    })
    return {
      id: undefined,
      productId,
      companyId: newRequest.companyId,
      types: newRequest.types,
      forms: newRequest.forms,
      notes,
      deadline: newRequest.deadline
    }
  }
}
