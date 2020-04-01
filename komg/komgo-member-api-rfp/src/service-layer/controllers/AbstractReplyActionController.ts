import { ErrorCode } from '@komgo/error-utilities'
import { LogstashCapableLogger } from '@komgo/logging'
import { ErrorUtils } from '@komgo/microservice-config'
import { ActionType } from '@komgo/types'
import { Controller } from 'tsoa'

import FailedProcessReplyActionError from '../../business-layer/errors/FailedProcessReplyActionError'
import InvalidActionReplyError from '../../business-layer/errors/InvalidActionReplyError'
import MissingRequiredData from '../../business-layer/errors/MissingRequiredData'
import RFPNotFoundError from '../../business-layer/errors/RFPNotFoundError'
import { ErrorName } from '../../ErrorName'

export abstract class AbstractReplyActionController extends Controller {
  constructor(protected readonly logger: LogstashCapableLogger) {
    super()
  }

  protected logAndThrowHttpException(error: any, rfpId: string, actionType: ActionType) {
    if (error instanceof FailedProcessReplyActionError) {
      throw ErrorUtils.internalServerException(ErrorCode.ConnectionInternalMQ)
    } else if (error instanceof RFPNotFoundError) {
      throw ErrorUtils.notFoundException(ErrorCode.ValidationHttpContent, error.message)
    } else if (error instanceof MissingRequiredData) {
      throw ErrorUtils.internalServerException(ErrorCode.DatabaseMissingData)
    } else if (error instanceof InvalidActionReplyError) {
      throw ErrorUtils.conflictException(ErrorCode.ValidationHttpContent, error.message)
    }
    this.logger.error(
      ErrorCode.UnexpectedError,
      actionType === ActionType.Response ? ErrorName.CreateRFPResponseError : ErrorName.CreateRFPRejectError,
      `Unable to create RFP action - ${actionType}`,
      {
        errorMessage: error.message,
        rfpId
      }
    )
    throw ErrorUtils.internalServerException(ErrorCode.UnexpectedError)
  }
}
