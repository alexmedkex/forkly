import { ErrorCode } from '@komgo/error-utilities'
import { getLogger } from '@komgo/logging'
import { ErrorUtils, HttpException, validateRequest } from '@komgo/microservice-config'
import { IRFPRequestResponse, IActionsResponse, IOutboundActionResult, ActionType } from '@komgo/types'
import { inject } from 'inversify'
import { Controller, Route, Tags, Post, Body, Response, SuccessResponse, Get, Path } from 'tsoa'

import FailedProcessRequestActionsError from '../../business-layer/errors/FailedProcessRequestActionsError'
import RFPNotFoundError from '../../business-layer/errors/RFPNotFoundError'
import { GetActionsUseCase } from '../../business-layer/GetActionsUseCase'
import { CreateRequestUseCase } from '../../business-layer/outbound-actions/corporate/CreateRequestUseCase'
import SendOutboundRequestUseCase from '../../business-layer/outbound-actions/corporate/SendOutboundRequestUseCase'
import { ErrorName } from '../../ErrorName'
import { provideSingleton } from '../../inversify/ioc'
import { TYPES } from '../../inversify/types'
import CreateRFPRequest from '../requests/CreateRFPRequest'

/**
 * RequestActionController Class
 * @export
 * @class RequestActionController
 * @extends {Controller}
 */
@Tags('RequestAction')
@Route('request')
@provideSingleton(RequestActionController)
export class RequestActionController extends Controller {
  private readonly logger = getLogger('RequestActionController')

  constructor(
    @inject(TYPES.CreateRequestUseCase) private readonly createRequestUseCase: CreateRequestUseCase,
    @inject(TYPES.SendOutboundRequestUseCase) private readonly sendOutboundRequestUseCase: SendOutboundRequestUseCase,
    @inject(TYPES.GetActionsUseCase) private readonly getActionsUseCase: GetActionsUseCase
  ) {
    super()
  }

  /**
   * Create the RFP Request
   *
   * @param rfpRequest the data to save
   * @returns the staticId of the saved request data
   */
  @Response<HttpException>('422', 'Invalid request data')
  @Response<HttpException>('500', 'Internal server error')
  @Post()
  @SuccessResponse(200, 'Created')
  public async create(@Body() rfpRequest: CreateRFPRequest): Promise<IRFPRequestResponse> {
    await validateRequest(CreateRFPRequest, rfpRequest)

    try {
      const rfpStaticId = await this.createRequestUseCase.execute(rfpRequest.rfp, rfpRequest.participantStaticIds)
      const actionStatuses: IOutboundActionResult[] = await this.sendOutboundRequestUseCase.execute(rfpStaticId)
      return { staticId: rfpStaticId, actionStatuses }
    } catch (error) {
      this.logAndThrowHttpExceptionForCreate(error, rfpRequest)
    }
  }

  @Response<HttpException>('500', 'Internal server error')
  @Get('{rfpId}/actions')
  @SuccessResponse(200, 'Actions')
  public async getRequestActions(@Path() rfpId: string): Promise<IActionsResponse> {
    try {
      const actions = await this.getActionsUseCase.execute(rfpId, ActionType.Request)
      this.logger.info(`Returning ${actions.length} actions`, { rfpId })
      return { actions }
    } catch (error) {
      this.logAndThrowHttpExceptionForGetActions(error, rfpId)
    }
  }

  private logAndThrowHttpExceptionForCreate(error: any, rfpRequest: CreateRFPRequest) {
    if (error instanceof FailedProcessRequestActionsError) {
      this.logger.error(ErrorCode.ConnectionInternalMQ, ErrorName.FailedProcessRequestActionsError, error.message, {
        rfp: {
          participantStaticIds: rfpRequest.participantStaticIds,
          context: rfpRequest.rfp.context,
          staticId: error.rfpId
        }
      })
      throw ErrorUtils.internalServerException(ErrorCode.ConnectionInternalMQ)
    } else {
      this.logger.error(ErrorCode.UnexpectedError, ErrorName.CreateRFPRequestError, 'Unable to create RFP Request', {
        errorMessage: error.message,
        rfp: { participantStaticIds: rfpRequest.participantStaticIds, context: rfpRequest.rfp.context }
      })
      throw ErrorUtils.internalServerException(ErrorCode.UnexpectedError)
    }
  }

  private logAndThrowHttpExceptionForGetActions(error: any, rfpId: string) {
    this.logger.error(ErrorCode.UnexpectedError, ErrorName.GetActionsError, 'Unable to get request Actions', {
      errorMessage: error.message,
      rfpId,
      ActionType
    })
    if (error instanceof RFPNotFoundError) {
      throw ErrorUtils.notFoundException(ErrorCode.ValidationHttpContent, `RFP with ${rfpId} not found`)
    }
    throw ErrorUtils.internalServerException(ErrorCode.UnexpectedError)
  }
}
