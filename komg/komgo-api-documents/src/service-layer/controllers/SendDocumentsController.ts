import { ErrorCode } from '@komgo/error-utilities'
import { getLogger } from '@komgo/logging'
import { ErrorUtils, HttpException, validateRequest } from '@komgo/microservice-config'
import { Body, Controller, Path, Post, Route, Security, Tags, Get, Query, Response } from 'tsoa'

import { ISendDocuments } from '../../business-layer/services/entities/ISendDocuments'
import { SendDocumentsService } from '../../business-layer/services/SendDocumentsService'
import SharedDocumentsDataAgent from '../../data-layer/data-agents/SharedDocumentsDataAgent'
import { IFullSharedDocuments } from '../../data-layer/models/shared-documents'
import { MeterOutcome } from '../../infrastructure/metrics/metrics'
import { inject, provideSingleton } from '../../inversify/ioc'
import { TYPES } from '../../inversify/types'
import { ErrorName } from '../../utils/ErrorName'
import { SendDocumentsRequest } from '../request/document'
import { SendDocumentsRequestExtended } from '../request/document/SendDocumentsRequestExtended'
import { convertDocuments, convertFullSharedDocuments } from '../responses/converters'
import { IDocumentResponse } from '../responses/document'
import { IFullSharedDocumentsResponse } from '../responses/shared-documents'

import ControllerUtils from './utils'

/**
 * Controller for ad-hoc documents sharing
 * @export
 * @extends {Controller}
 */
@Tags('SendDocuments')
@Route('products')
@provideSingleton(SendDocumentsController)
export class SendDocumentsController extends Controller {
  private readonly logger = getLogger('SendDocumentsController')

  constructor(
    @inject(TYPES.SendDocumentsService) private readonly sendDocumentsService: SendDocumentsService,
    @inject(TYPES.SharedDocumentsDataAgent) private readonly shareDocumentsDataAgent: SharedDocumentsDataAgent,
    @inject(TYPES.ControllerUtils) private readonly controllerUtils: ControllerUtils
  ) {
    super()
  }

  /**
   * Sends one or more documents to a given counterparty
   * @param productId Identifier of the product (e.g.: kyc, tradeFinance...)
   * @param sendDocumentRequest Send documents payload, namely a list of documents to be sent
   */
  @MeterOutcome('documentsSharedOutcome')
  @Response<HttpException>('422', 'Product ID does not exist')
  @Security('withPermission', ['kyc', 'manageDocRequest', 'crudAndShare'])
  @Security('withPermission', ['tradeFinance', 'manageRD', 'crud'])
  @Security('withPermission', ['tradeFinance', 'manageRDRequest', 'crud'])
  @Post('{productId}/send-documents')
  public async SendDocuments(
    @Path('productId') productId: string,
    @Body() sendDocumentRequest: SendDocumentsRequest
  ): Promise<IDocumentResponse[]> {
    await validateRequest(SendDocumentsRequest, sendDocumentRequest)
    return this.sendDocuments(productId, this.convertToSendDocuments(sendDocumentRequest))
  }

  /**
   * Sends one or more documents to a given counterparty. These do not require review on the counterparty end
   * @param productId Identifier of the product (e.g.: kyc, tradeFinance...)
   * @param sendDocumentRequest Send documents payload, namely a list of documents to be sent
   */
  @Response<HttpException>('422', 'Product ID does not exist')
  @Security('internal')
  @Post('{productId}/send-documents/internal')
  public async SendDocumentsInternal(
    @Path('productId') productId: string,
    @Body() sendDocumentRequest: SendDocumentsRequestExtended
  ): Promise<IDocumentResponse[]> {
    await validateRequest(SendDocumentsRequest, sendDocumentRequest)

    return this.sendDocuments(productId, this.convertToSendDocumentsExtended(sendDocumentRequest))
  }

  /**
   * Retrieve all sent documents by a given product ID
   * @param productId Identifier of the product (e.g.: kyc, tradeFinance...)
   * @param context Optional query context
   */
  @Response<HttpException>('422', 'Product ID does not exist or context is malformed')
  @Security('withPermission', ['kyc', 'reviewDoc'])
  @Security('withPermission', ['tradeFinance', 'manageRD', 'crud'])
  @Security('withPermission', ['tradeFinance', 'manageRDRequest', 'crud'])
  @Get('{productId}/send-documents')
  public async GetSendDocumentsByProduct(
    @Path('productId') productId: string,
    @Query('context') context?: string
  ): Promise<IFullSharedDocumentsResponse[]> {
    // throws 422 if product ID is unknown
    await this.controllerUtils.validateProductId(productId)
    // throws 422 if it is unable to parse value
    const filter = this.controllerUtils.parseJSONParam(context, 'context')
    const requests = await this.shareDocumentsDataAgent.getAllWithContext(productId, filter)
    return requests.map(sharedDocuments => convertFullSharedDocuments(sharedDocuments))
  }

  /**
   * Retrieve all sent documents by a given request ID
   * @param productId Identifier of the product (e.g.: kyc, tradeFinance...)
   * @param requestId Request ID to filter the db query
   */
  @Response<HttpException>('422', 'Product ID or Request ID do not exist')
  @Security('withPermission', ['kyc', 'reviewDoc'])
  @Get('{productId}/send-documents/{requestId}')
  public async GetSendDocumentsByRequestId(
    @Path('productId') productId: string,
    @Path('requestId') requestId: string
  ): Promise<IFullSharedDocumentsResponse[]> {
    await this.controllerUtils.validateProductId(productId)
    // It should be included in incoming-requests collection
    await this.controllerUtils.validateRequestId(productId, requestId)

    const sharedDocumentsByRequestID: IFullSharedDocuments[] = await this.shareDocumentsDataAgent.getAllByRequestId(
      productId,
      requestId
    )

    return sharedDocumentsByRequestID.map(sharedDocuments => convertFullSharedDocuments(sharedDocuments))
  }

  private async sendDocuments(productId: string, request: SendDocumentsRequestExtended) {
    // throws 422 if product ID is unknown
    await this.controllerUtils.validateProductId(productId)
    try {
      const documents = await this.sendDocumentsService.sendDocuments(productId, request)
      return convertDocuments(documents)
    } catch (error) {
      this.logger.warn(ErrorCode.UnexpectedError, ErrorName.ShareDocumentsError, 'Failed to share documents', {
        companyId: request.companyId,
        errorMessage: error.message
      })
      if (error instanceof HttpException) {
        throw error
      } else {
        throw ErrorUtils.internalServerException(ErrorCode.ConnectionInternalMQ)
      }
    }
  }

  private convertToSendDocuments(sendDocumentRequest: SendDocumentsRequest): ISendDocuments {
    return {
      requestId: sendDocumentRequest.requestId,
      companyId: sendDocumentRequest.companyId,
      context: sendDocumentRequest.context,
      documents: sendDocumentRequest.documents,
      reviewNotRequired: sendDocumentRequest.context ? sendDocumentRequest.context.reviewNotRequired : false,
      documentShareNotification: sendDocumentRequest.context
        ? sendDocumentRequest.context.documentShareNotification
        : false,
      note: sendDocumentRequest.note
    }
  }

  private convertToSendDocumentsExtended(sendDocumentRequest: SendDocumentsRequestExtended): ISendDocuments {
    return {
      ...this.convertToSendDocuments(sendDocumentRequest),
      reviewNotRequired: sendDocumentRequest.reviewNotRequired
    }
  }
}
