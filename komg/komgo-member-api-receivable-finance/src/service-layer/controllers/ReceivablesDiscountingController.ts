import { getLogger } from '@komgo/logging'
import { HttpException } from '@komgo/microservice-config'
import {
  IReceivablesDiscountingBase,
  IReceivablesDiscountingCreated,
  IRFPSummariesResponse,
  IParticipantRFPSummary,
  IReceivablesDiscounting,
  IHistory
} from '@komgo/types'
import { inject } from 'inversify'
import { Body, Controller, Get, Path, Post, Query, Response, Route, Security, Tags, SuccessResponse, Put } from 'tsoa'

import {
  CreateRDUseCase,
  ShareRDUseCase,
  UpdateRDUseCase,
  GetRDHistoryUseCase,
  ReplaceRDUseCase,
  AddDiscountingUseCase
} from '../../business-layer/rd/use-cases'
import { GetParticipantRFPSummaryUseCase, GetRFPSummaryUseCase } from '../../business-layer/rfp/use-cases'
import { provideSingleton } from '../../inversify/ioc'
import { TYPES } from '../../inversify/types'

import { mapAndThrowHttpException, INTERNAL_SERVER_ERROR_MESSAGE, cleanDBFieldsFromRD } from './utils'

/**
 * ReceivablesDiscountingController Class
 *
 * @export
 * @class ReceivablesDiscountingController
 * @extends {Controller}
 */
@Tags('ReceivablesDiscounting')
@Route('rd')
@provideSingleton(ReceivablesDiscountingController)
export class ReceivablesDiscountingController extends Controller {
  private readonly logger = getLogger('ReceivablesDiscountingController')

  constructor(
    @inject(TYPES.CreateRDUseCase) private readonly createRDUseCase: CreateRDUseCase,
    @inject(TYPES.UpdateRDUseCase) private readonly updateRDUseCase: UpdateRDUseCase,
    @inject(TYPES.ReplaceRDUseCase) private readonly replaceRDUseCase: ReplaceRDUseCase,
    @inject(TYPES.GetRFPSummaryUseCase) private readonly getRFPSummaryUseCase: GetRFPSummaryUseCase,
    @inject(TYPES.GetParticipantRFPSummaryUseCase)
    private readonly getParticipantRFPSummaryUseCase: GetParticipantRFPSummaryUseCase,
    @inject(TYPES.ShareRDUseCase) private readonly shareRDUseCase: ShareRDUseCase,
    @inject(TYPES.GetRDHistoryUseCase) private readonly getRDHistoryUseCase: GetRDHistoryUseCase,
    @inject(TYPES.AddDiscountingUseCase) private readonly addDiscountingUseCase: AddDiscountingUseCase
  ) {
    super()
  }

  /**
   * Creates the receivables discounting data
   *
   * @param rdBase the data to save
   * @returns the staticId of the saved receivables discounting application
   */
  @Response<HttpException>('409', 'Duplicate trade data used')
  @Response<HttpException>('422', 'Invalid receivables discounting data')
  @Response<HttpException>('500', INTERNAL_SERVER_ERROR_MESSAGE)
  @Security('withPermission', ['tradeFinance', 'manageRD', 'crud'])
  @SuccessResponse(200, 'Created')
  @Post()
  public async create(@Body() rdBase: IReceivablesDiscountingBase): Promise<IReceivablesDiscountingCreated> {
    try {
      const rdApplication = await this.createRDUseCase.execute(rdBase)
      return { staticId: rdApplication.staticId }
    } catch (error) {
      mapAndThrowHttpException(this.logger, error)
    }
  }

  /**
   * Updates the receivables discounting data
   *
   * @param id the ID of the RD to update
   * @param rdBase the update data
   */
  @Response<HttpException>('422', 'Invalid receivables discounting data')
  @Response<HttpException>('404', 'Receivable discounting not found')
  @Response<HttpException>('500', INTERNAL_SERVER_ERROR_MESSAGE)
  @Security('withPermission', ['tradeFinance', 'manageRD', 'crud'])
  @SuccessResponse('200', 'PUT')
  @Put('{id}')
  public async update(
    id: string,
    @Body() rdBase: any,
    @Query('replace') replace: boolean = false
  ): Promise<IReceivablesDiscounting> {
    try {
      this.logger.info('Update / Replace RD', { rdId: id, replace })
      if (replace) {
        return await this.replaceRDUseCase.execute(id, cleanDBFieldsFromRD(rdBase))
      } else {
        return await this.updateRDUseCase.execute(id, cleanDBFieldsFromRD(rdBase))
      }
    } catch (error) {
      mapAndThrowHttpException(this.logger, error)
    }
  }

  @Security('withPermission', ['tradeFinance', 'manageRD', 'read'])
  @Security('withPermission', ['tradeFinance', 'manageRDRequest', 'read'])
  @Response<HttpException>('404', 'Receivable discounting not found')
  @Response<HttpException>('500', INTERNAL_SERVER_ERROR_MESSAGE)
  @Get('{id}/history')
  @SuccessResponse(200, 'Receivable discounting change history')
  public async getHistory(@Path() id: string): Promise<IHistory<IReceivablesDiscounting>> {
    try {
      return await this.getRDHistoryUseCase.execute(id)
    } catch (error) {
      mapAndThrowHttpException(this.logger, error)
    }
  }

  /**
   * Gets the RFP summaries of a Receivables discounting application
   *
   * @param rdId Receivable discounting id
   * @returns the list of participants RFP summaries
   */
  @Security('withPermission', ['tradeFinance', 'manageRD', 'read'])
  @Response<HttpException>('404', 'RD not found')
  @Response<HttpException>('500', INTERNAL_SERVER_ERROR_MESSAGE)
  @Get('{rdId}/request-for-proposal')
  public async getRFP(@Path() rdId: string): Promise<IRFPSummariesResponse> {
    try {
      const summaries = await this.getRFPSummaryUseCase.execute(rdId)
      return { summaries }
    } catch (error) {
      mapAndThrowHttpException(this.logger, error)
    }
  }

  /**
   * Gets the RFP summary of a Receivables discounting application for a participant
   *
   * @param rdId Receivable discounting id
   * @param participantId Participant static id
   * @returns a single RFP summary
   */
  @Security('withPermission', ['tradeFinance', 'manageRD', 'read'])
  @Security('withPermission', ['tradeFinance', 'manageRDRequest', 'read'])
  @Response<HttpException>('404', 'RD or RFP for participantId not found')
  @Response<HttpException>('500', INTERNAL_SERVER_ERROR_MESSAGE)
  @Get('{rdId}/request-for-proposal/{participantId}')
  public async getParticipantRFP(@Path() rdId: string, @Path() participantId: string): Promise<IParticipantRFPSummary> {
    try {
      return await this.getParticipantRFPSummaryUseCase.execute(rdId, participantId)
    } catch (error) {
      mapAndThrowHttpException(this.logger, error)
    }
  }

  /**
   * Shares the Receivable Discounting data with the accepted financial institution
   */
  @Response<HttpException>('500', INTERNAL_SERVER_ERROR_MESSAGE)
  @Response<HttpException>('404', 'RD not found')
  @Response<HttpException>('422', 'RD has not been accepted')
  @Security('withPermission', ['tradeFinance', 'manageRD', 'crud'])
  @Post('{rdId}/share')
  @SuccessResponse(204, 'Receivable Discounting data shared')
  public async share(@Path() rdId: string): Promise<void> {
    try {
      return await this.shareRDUseCase.execute(rdId)
    } catch (error) {
      mapAndThrowHttpException(this.logger, error)
    }
  }

  /**
   * Request adding discounting
   */
  @Response<HttpException>('500', INTERNAL_SERVER_ERROR_MESSAGE)
  @Response<HttpException>('404', 'RD not found')
  @Response<HttpException>('409', 'Add discounting request has already been performed')
  @Response<HttpException>('422', 'RD has not been accepted and/or is not Risk cover with discounting')
  @Security('withPermission', ['tradeFinance', 'manageRD', 'crud'])
  @Post('{rdId}/add-discounting')
  @SuccessResponse(204, 'Add discounting request sent')
  public async addDiscounting(@Path() rdId: string): Promise<void> {
    try {
      return await this.addDiscountingUseCase.execute(rdId)
    } catch (error) {
      mapAndThrowHttpException(this.logger, error)
    }
  }
}
