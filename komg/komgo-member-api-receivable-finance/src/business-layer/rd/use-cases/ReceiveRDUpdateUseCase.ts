import { ErrorCode } from '@komgo/error-utilities'
import { getLogger } from '@komgo/logging'
import { tradeFinanceManager } from '@komgo/permissions'
import { IReceivablesDiscounting, ReplyType } from '@komgo/types'
import { inject, injectable } from 'inversify'

import { ReceivablesDiscountingValidator } from '../../../business-layer/validation'
import { ReceivablesDiscountingDataAgent, ReplyDataAgent } from '../../../data-layer/data-agents'
import { ErrorName } from '../../../ErrorName'
import { TYPES, VALUES } from '../../../inversify'
import { cleanDBFieldsFromRD } from '../../../service-layer/controllers/utils'
import {
  validateUpdateFields,
  stripTradeReferenceDBFields,
  RECEIVABLE_DISCOUNTING_UNEDITABLE_FIELDS,
  removeTimeFromDates
} from '../../../utils'
import { ValidationFieldError, InvalidPayloadProcessingError, EntityNotFoundError } from '../../errors'
import { NotificationClient } from '../../microservice-clients'
import { UpdateType, IReceivableFinanceMessage, IRDUpdatePayload, IReceiveUpdateUseCase } from '../../types'

@injectable()
export class ReceiveRDUpdateUseCase implements IReceiveUpdateUseCase<IReceivablesDiscounting> {
  private logger = getLogger('ReceiveRDUpdateUseCase')

  constructor(
    @inject(TYPES.ReceivablesDiscountingDataAgent) private readonly rdDataAgent: ReceivablesDiscountingDataAgent,
    @inject(TYPES.ReceivablesDiscountingValidator) private readonly rdValidator: ReceivablesDiscountingValidator,
    @inject(TYPES.ReplyDataAgent) private readonly replyDataAgent: ReplyDataAgent,
    @inject(TYPES.NotificationClient) private readonly notificationClient: NotificationClient,
    @inject(VALUES.CompanyStaticId) private readonly companyStaticId: string
  ) {}

  public async execute(message: IReceivableFinanceMessage<IRDUpdatePayload>): Promise<void> {
    const updateRD = message.data.entry

    this.logger.info('Received RD Update message', { rdId: updateRD.staticId })
    const currentRD = await this.rdDataAgent.findByStaticId(updateRD.staticId)
    if (!currentRD) {
      this.throwProcessingError('request not found')
    }

    if (new Date(currentRD.createdAt).getTime() >= new Date(updateRD.createdAt).getTime()) {
      this.logger.info('Received is older or the same as current RD. Skipping update')
      return
    }

    const acceptedReply = await this.replyDataAgent.findByRdIdAndType(updateRD.staticId, ReplyType.Accepted)
    if (!acceptedReply) {
      this.throwProcessingError('request has not been accepted')
    }
    if (acceptedReply.participantId !== this.companyStaticId) {
      this.throwProcessingError('not for this company')
    }

    await this.validate(updateRD, currentRD)
    await this.updateRD(updateRD)

    const notification = await this.notificationClient.createUpdateNotification(
      updateRD,
      message.data.senderStaticId,
      UpdateType.ReceivablesDiscounting,
      tradeFinanceManager.canReadRDRequests.action,
      message.context,
      updateRD.createdAt
    )
    await this.notificationClient.sendNotification(notification)

    this.logger.info('RD Update successfully saved')
  }

  private throwProcessingError(errorMsg: string) {
    const msg = `Unable to update RD - ${errorMsg}`
    this.logger.error(ErrorCode.ValidationInternalAMQP, ErrorName.UpdateRDFailedInvalidState, msg)
    throw new InvalidPayloadProcessingError(msg)
  }

  private async validate(update: IReceivablesDiscounting, current: IReceivablesDiscounting) {
    try {
      this.rdValidator.validateFields(removeTimeFromDates(cleanDBFieldsFromRD(update)))
      validateUpdateFields(
        stripTradeReferenceDBFields(current),
        update,
        RECEIVABLE_DISCOUNTING_UNEDITABLE_FIELDS,
        this.logger
      )
    } catch (e) {
      const msg = 'Unable to edit RD'
      if (e instanceof ValidationFieldError) {
        this.logger.error(ErrorCode.ValidationInternalAMQP, ErrorName.ReceiveRDUpdateInvalidData, msg, {
          validationFieldErrors: e.validationErrors,
          errorMessage: e.message
        })
        throw new InvalidPayloadProcessingError(msg)
      } else {
        this.logger.error(ErrorCode.ValidationInternalAMQP, ErrorName.UnexpectedError, msg, {
          errorMessage: e.message
        })
        throw e
      }
    }
  }

  private async updateRD(rd: IReceivablesDiscounting) {
    try {
      await this.rdDataAgent.updateCreate(rd)
      this.logger.info('Saved updated RD', { rdId: rd.staticId })
    } catch (error) {
      if (error instanceof EntityNotFoundError || error instanceof ValidationFieldError) {
        throw new InvalidPayloadProcessingError(`Unable to update RD ${rd.staticId}`)
      }
      throw error
    }
  }
}
