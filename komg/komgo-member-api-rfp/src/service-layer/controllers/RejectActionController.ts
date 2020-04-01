import { getLogger } from '@komgo/logging'
import { HttpException, validateRequest } from '@komgo/microservice-config'
import { IRFPReplyResponse, ActionType } from '@komgo/types'
import { inject } from 'inversify'
import { Route, Tags, Post, Body, Response, SuccessResponse, Path } from 'tsoa'

import { ReplyUseCase } from '../../business-layer/outbound-actions/finanical-institution/ReplyUseCase'
import { provideSingleton } from '../../inversify/ioc'
import { TYPES } from '../../inversify/types'
import CreateRFPReplyRequest from '../requests/CreateRFPReplyRequest'

import { AbstractReplyActionController } from './AbstractReplyActionController'

/**
 * RejectActionController Class
 * @export
 * @class RejectActionController
 * @extends {Controller}
 */
@Tags('RejectAction')
@Route('reject')
@provideSingleton(RejectActionController)
export class RejectActionController extends AbstractReplyActionController {
  constructor(@inject(TYPES.ReplyUseCase) private readonly replyUseCase: ReplyUseCase) {
    super(getLogger('RejectActionController'))
  }

  /**
   * Create the RFP Response
   *
   * @param request the data to save
   * @returns the staticId of the saved request data
   */
  @Response<HttpException>('422', 'Invalid request data')
  @Response<HttpException>('409', 'Conflict when creating action')
  @Response<HttpException>('500', 'Internal server error')
  @Post('{rfpId}')
  @SuccessResponse(200, 'Created')
  public async create(@Path() rfpId, @Body() request: CreateRFPReplyRequest): Promise<IRFPReplyResponse> {
    await validateRequest(CreateRFPReplyRequest, request)
    try {
      return await this.replyUseCase.execute(rfpId, ActionType.Reject, request.responseData)
    } catch (error) {
      this.logAndThrowHttpException(error, rfpId, ActionType.Reject)
    }
  }
}
