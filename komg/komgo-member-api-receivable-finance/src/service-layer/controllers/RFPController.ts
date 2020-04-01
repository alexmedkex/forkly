import { getLogger } from '@komgo/logging'
import { HttpException, validateRequest } from '@komgo/microservice-config'
import { IRFPRequestResponse, IRFPReplyResponse, IRFPAcceptResponse } from '@komgo/types'
import { inject } from 'inversify'
import { Controller, Route, Tags, Security, Post, Body, Header, Response, SuccessResponse } from 'tsoa'

import {
  AcceptQuoteUseCase,
  CreateRFPRequestUseCase,
  RejectRFPUseCase,
  SubmitQuoteUseCase
} from '../../business-layer/rfp/use-cases'
import { provideSingleton } from '../../inversify/ioc'
import { TYPES } from '../../inversify/types'
import { ReceivablesDiscountingRFPRequest, QuoteSubmission, RFPReply, QuoteAccept } from '../requests'

import { mapAndThrowHttpException, INTERNAL_SERVER_ERROR_MESSAGE, getUserId } from './utils'

/**
 * RFPController Class
 *
 * @export
 * @class RFPController
 * @extends {Controller}
 */
@Tags('RFP')
@Route('request-for-proposal')
@provideSingleton(RFPController)
export class RFPController extends Controller {
  private readonly logger = getLogger('RFPController')

  constructor(
    @inject(TYPES.CreateRFPRequestUseCase) private readonly createRFPRequestUseCase: CreateRFPRequestUseCase,
    @inject(TYPES.SubmitQuoteUseCase) private readonly submitQuoteUseCase: SubmitQuoteUseCase,
    @inject(TYPES.RejectRFPUseCase) private readonly rejectRFPUseCase: RejectRFPUseCase,
    @inject(TYPES.AcceptQuoteUseCase) private readonly acceptQuoteUseCase: AcceptQuoteUseCase
  ) {
    super()
  }

  /**
   * Creates a new request for proposal
   *
   * @param rfpRequest the Request For Proposal request
   * @returns the staticId of the request for proposal and the action statuses
   */
  @Response<HttpException>('422', 'Failed to validate rfp request data')
  @Response<HttpException>('409', 'Duplicate receivable discounting id')
  @Response<HttpException>('500', INTERNAL_SERVER_ERROR_MESSAGE)
  @Security('withPermission', ['tradeFinance', 'manageRD', 'crud'])
  @Post('request')
  @SuccessResponse(200, 'Send request for proposal')
  public async create(@Body() rfpRequest: ReceivablesDiscountingRFPRequest): Promise<IRFPRequestResponse> {
    await validateRequest(ReceivablesDiscountingRFPRequest, rfpRequest)

    try {
      return await this.createRFPRequestUseCase.execute(rfpRequest)
    } catch (error) {
      mapAndThrowHttpException(this.logger, error)
    }
  }

  /**
   * Submits a new quote for a given RFP (Financial institution only)
   *
   * @param quoteSubmision the quote submission
   * @returns the staticId of the request for proposal and the action status
   */
  @Response<HttpException>('422', 'Failed to validate quote submission data')
  @Response<HttpException>('409', 'Quote already submitted')
  @Response<HttpException>('500', INTERNAL_SERVER_ERROR_MESSAGE)
  @Security('withPermission', ['tradeFinance', 'manageRDRequest', 'crud'])
  @Post('submit-quote')
  @SuccessResponse(200, 'Quote submission sent')
  public async submitQuote(
    @Header('Authorization') authHeader: string,
    @Body() quoteSubmission: QuoteSubmission
  ): Promise<IRFPReplyResponse> {
    const userId = getUserId(authHeader, this.logger)

    await validateRequest(QuoteSubmission, quoteSubmission)

    try {
      return await this.submitQuoteUseCase.execute(quoteSubmission, userId)
    } catch (error) {
      mapAndThrowHttpException(this.logger, error)
    }
  }

  /**
   * Rejects a given RFP (Financial institution only)
   *
   * @param rfpRejection the RFP rejection
   * @returns the staticId of the request for proposal and the action status
   */
  @Response<HttpException>('422', 'Failed to validate rejection data')
  @Response<HttpException>('409', 'Rejection already submitted')
  @Response<HttpException>('500', INTERNAL_SERVER_ERROR_MESSAGE)
  @Security('withPermission', ['tradeFinance', 'manageRDRequest', 'crud'])
  @Post('reject')
  @SuccessResponse(200, 'RFP Rejection sent')
  public async reject(
    @Header('Authorization') authHeader: string,
    @Body() rfpRejection: RFPReply
  ): Promise<IRFPReplyResponse> {
    const userId = getUserId(authHeader, this.logger)

    await validateRequest(RFPReply, rfpRejection)

    try {
      return await this.rejectRFPUseCase.execute(rfpRejection, userId)
    } catch (error) {
      mapAndThrowHttpException(this.logger, error)
    }
  }

  /**
   * Accepts and submits a new quote for a given RFP (Trader only)
   *
   * @param quoteAccept the quote accept data
   * @returns the staticId of the request for proposal and the action status
   */
  @Response<HttpException>('422', 'Failed to validate quote accept data')
  @Response<HttpException>('409', 'Quote already accepted')
  @Response<HttpException>('500', INTERNAL_SERVER_ERROR_MESSAGE)
  @Security('withPermission', ['tradeFinance', 'manageRD', 'crud'])
  @Post('accept-quote')
  @SuccessResponse(200, 'Quote accept sent')
  public async acceptQuote(
    @Header('Authorization') authHeader: string,
    @Body() quoteAccept: QuoteAccept
  ): Promise<IRFPAcceptResponse> {
    const userId = getUserId(authHeader, this.logger)

    await validateRequest(QuoteAccept, quoteAccept)

    try {
      return await this.acceptQuoteUseCase.execute(quoteAccept, userId)
    } catch (error) {
      mapAndThrowHttpException(this.logger, error)
    }
  }
}
