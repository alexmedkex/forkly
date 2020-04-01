import { ErrorCode } from '@komgo/error-utilities'
import { ErrorUtils, HttpException } from '@komgo/microservice-config'
import { Body, Controller, Get, Patch, Path, Post, Query, Route, Security, Tags, Response, Header } from 'tsoa'

import { ReceivedDocumentsService } from '../../business-layer/services/ReceivedDocumentsService'
import { IDocumentReview, IReceivedDocuments } from '../../data-layer/models/received-documents'
import { MeterOutcome } from '../../infrastructure/metrics/metrics'
import { inject, provideSingleton } from '../../inversify/ioc'
import { TYPES } from '../../inversify/types'
import { DocumentsReviewUpdate } from '../request/received-documents/DocumentsReviewUpdate'
import {
  convertFullReceivedDocuments,
  convertReceivedDocuments,
  convertReceivedDocumentsAggregated
} from '../responses/converters'
import {
  IFullReceivedDocumentsResponse,
  IReceivedDocumentsResponse,
  IReceivedDocumentsAggregationResponse
} from '../responses/received-documents'

import ControllerUtils from './utils'

/**
 * Received documents controller.
 * @export
 */
@Tags('Received documents')
@Route('/products')
@provideSingleton(ReceivedDocumentsController)
export class ReceivedDocumentsController extends Controller {
  constructor(
    @inject(TYPES.ReceivedDocumentsService) private readonly receivedDocumentsService: ReceivedDocumentsService,
    @inject(TYPES.ControllerUtils) private readonly controllerUtils: ControllerUtils
  ) {
    super()
  }

  /**
   * Retrieve a received document by product ID and received document ID.
   * @param productId Identifier of the product (e.g.: kyc, tradeFinance...)
   * @param receivedDocumentsId Identifier of the received document in UUID format
   */
  @Response<HttpException>('404', 'Received document does not exist')
  @Response<HttpException>('422', 'Product ID does not exist')
  @Security('withPermission', ['kyc', 'reviewDoc'])
  @Get('{productId}/received-documents/{receivedDocumentsId}')
  public async GetReceivedDocumentsById(
    productId: string,
    receivedDocumentsId: string
  ): Promise<IFullReceivedDocumentsResponse> {
    // throws 422 if product ID is unknown
    await this.controllerUtils.validateProductId(productId)
    const request = await this.receivedDocumentsService.getById(productId, receivedDocumentsId)
    if (request != null) {
      return convertFullReceivedDocuments(request)
    } else {
      throw ErrorUtils.notFoundException(ErrorCode.ValidationHttpContent, 'Received documents not found')
    }
  }

  /**
   * Retrieve a received document by product ID and by optionally filter by context (for trade finance only)
   * @param productId Identifier of the product (e.g.: kyc, tradeFinance...)
   * @param context Trade Finance context filter for the LC flow
   */
  @Response<HttpException>('422', 'Product ID does not exist')
  @Security('withPermission', ['kyc', 'reviewDoc'])
  @Get('{productId}/received-documents')
  public async GetReceivedDocumentsByProduct(
    @Path('productId') productId: string,
    @Query('context') context?: string
  ): Promise<IFullReceivedDocumentsResponse[]> {
    // throws 422 if product ID is unknown
    await this.controllerUtils.validateProductId(productId)
    // throws 422 if it is unable to parse value
    const filter = this.controllerUtils.parseJSONParam(context, 'context')
    const requests = await this.receivedDocumentsService.getAllWithContext(productId, filter)
    return requests.map(template => convertFullReceivedDocuments(template))
  }

  /**
   * Updates the review status of a given received document. As of now it is only used in KYC to review documents sent by a counterparty.
   * @param productId Identifier of the product (e.g.: kyc, tradeFinance...)
   * @param receivedDocumentsId Identifier of the received document in UUID format
   * @param update Object that updates the document status
   */
  @Response<HttpException>('404', 'Received document does not exist')
  @Response<HttpException>('422', 'Product ID does not exist')
  @Security('withPermission', ['kyc', 'reviewDoc'])
  @Patch('{productId}/received-documents/{receivedDocumentsId}/documents')
  public async UpdateDocumentStatus(
    productId: string,
    receivedDocumentsId: string,
    @Body() update: DocumentsReviewUpdate,
    @Header('Authorization') jwt?: string
  ): Promise<IReceivedDocumentsResponse> {
    // throws 422 if product ID is unknown
    await this.controllerUtils.validateProductId(productId)
    try {
      const uploaderUserId: string = jwt ? await this.controllerUtils.fetchUserIdByJwt(jwt) : undefined
      const documentReviews: IDocumentReview[] = this.convertToDocumentReviews(update, uploaderUserId)
      const receivedDocuments = await this.receivedDocumentsService.updateDocumentsStatus(
        productId,
        receivedDocumentsId,
        documentReviews
      )
      return convertReceivedDocuments(receivedDocuments)
    } catch (error) {
      // may throw 404 if entity was not found
      // may throw 409 if entity is duplicated
      // may throw 422 if entity was considered invalid
      this.controllerUtils.processDataLayerException(error)
    }
  }

  /**
   * Updates the review status by requestId. As of now it is only used in KYC to review documents sent by a counterparty.
   * @param productId Identifier of the product (e.g.: kyc, tradeFinance...)
   * @param requestId Identifier of the request related
   * @param update Object that updates the document status
   */
  @Response<HttpException>('404', 'Received document does not exist')
  @Response<HttpException>('422', 'Product ID does not exist')
  @Security('withPermission', ['kyc', 'reviewDoc'])
  @Patch('{productId}/received-documents/requests/{requestId}/documents')
  public async UpdateDocumentStatusByRequestId(
    @Path('productId') productId: string,
    @Path('requestId') requestId: string,
    @Body() update: DocumentsReviewUpdate,
    @Header('Authorization') jwt?: string
  ): Promise<IReceivedDocumentsAggregationResponse> {
    // throws 422 if product ID is unknown
    await this.controllerUtils.validateProductId(productId)
    try {
      const uploaderUserId: string = jwt ? await this.controllerUtils.fetchUserIdByJwt(jwt) : undefined
      const documentReviews: IDocumentReview[] = this.convertToDocumentReviews(update, uploaderUserId)
      const receivedDocuments: IReceivedDocuments[] = await this.receivedDocumentsService.updateDocumentsStatusByRequestId(
        productId,
        requestId,
        documentReviews
      )
      return convertReceivedDocumentsAggregated(receivedDocuments)
    } catch (error) {
      // may throw 404 if entity was not found
      // may throw 409 if entity is duplicated
      // may throw 422 if entity was considered invalid
      this.controllerUtils.processDataLayerException(error)
    }
  }

  /**
   * Send feedback of previously reviewed documents back to the company that sent them.
   * @param productId Identifier of the product (e.g.: kyc, tradeFinance...)
   * @param receivedDocumentsId Identifier of the received document in UUID format
   */
  @MeterOutcome('documentFeedbackOutcome')
  @Response<HttpException>('404', 'Received document does not exist')
  @Response<HttpException>('422', 'Product ID does not exist')
  @Security('withPermission', ['kyc', 'reviewDoc'])
  @Post('{productId}/received-documents/{receivedDocumentsId}/send-feedback')
  public async SendFeedback(productId: string, receivedDocumentsId: string): Promise<void> {
    // throws 422 if product ID is unknown
    await this.controllerUtils.validateProductId(productId)
    try {
      await this.receivedDocumentsService.sendFeedback(productId, receivedDocumentsId)
    } catch (error) {
      // may throw 404 if entity was not found
      // may throw 409 if entity is duplicated
      // may throw 422 if entity was considered invalid
      this.controllerUtils.processDataLayerException(error)
    }
  }

  private convertToDocumentReviews(update: DocumentsReviewUpdate, reviewerID: string): IDocumentReview[] {
    return update.documents.map(documentUpdate => {
      return {
        documentId: documentUpdate.documentId,
        status: documentUpdate.status,
        note: documentUpdate.note,
        reviewerId: reviewerID
      }
    })
  }
}
