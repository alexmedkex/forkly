import { getLogger } from '@komgo/logging'
import { HttpException } from '@komgo/microservice-config'
import { ActionType, IRFPAcceptResponse, IOutboundActionResult } from '@komgo/types'
import { inject } from 'inversify'
import { Route, Tags, Post, Body, Response, SuccessResponse, Path } from 'tsoa'

import { AutoDeclineUseCase } from '../../business-layer/outbound-actions/corporate/AutoDeclineUseCase'
import { CreateAcceptUseCase } from '../../business-layer/outbound-actions/corporate/CreateAcceptUseCase'
import SendOutboundReplyUseCase from '../../business-layer/outbound-actions/SendOutboundReplyUseCase'
import { provideSingleton } from '../../inversify/ioc'
import { TYPES } from '../../inversify/types'
import CreateRFPAcceptRequest from '../requests/CreateRFPAcceptRequest'

import { AbstractReplyActionController } from './AbstractReplyActionController'

/**
 * AcceptActionController Class
 * @export
 * @class AcceptActionController
 * @extends {Controller}
 */
@Tags('AcceptActionController')
@Route('accept')
@provideSingleton(AcceptActionController)
export class AcceptActionController extends AbstractReplyActionController {
  constructor(
    @inject(TYPES.CreateAcceptUseCase) private readonly createAcceptUseCase: CreateAcceptUseCase,
    @inject(TYPES.AutoDeclineUseCase) private readonly autoDeclineUseCase: AutoDeclineUseCase,
    @inject(TYPES.SendOutboundReplyUseCase) private readonly sendOutboundReplyUseCase: SendOutboundReplyUseCase
  ) {
    super(getLogger('AcceptActionController'))
  }

  /**
   * Create the RFP Accept
   *
   * @param request the data to save
   * @returns the staticId of the saved request data
   */
  @Response<HttpException>('422', 'Invalid request data')
  @Response<HttpException>('409', 'Conflict when creating action')
  @Response<HttpException>('500', 'Internal server error')
  @Post('{rfpId}')
  @SuccessResponse(200, 'Created')
  public async create(@Path() rfpId, @Body() request: CreateRFPAcceptRequest): Promise<IRFPAcceptResponse> {
    try {
      await this.createAcceptUseCase.execute(rfpId, request.responseData, request.participantStaticId)
      const acceptActionResult: IOutboundActionResult = await this.sendOutboundReplyUseCase.execute(
        rfpId,
        ActionType.Accept
      )
      const declinedActionResult: IOutboundActionResult[] = await this.autoDeclineUseCase.execute(rfpId)
      return { rfpId, actionStatuses: [acceptActionResult, ...declinedActionResult] }
    } catch (error) {
      this.logAndThrowHttpException(error, rfpId, ActionType.Reject)
    }
  }
}
