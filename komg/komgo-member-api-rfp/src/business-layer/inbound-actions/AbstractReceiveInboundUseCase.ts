import { ErrorCode } from '@komgo/error-utilities'
import { LogstashCapableLogger } from '@komgo/logging'
import { IRFPMessage, IRFPPayload } from '@komgo/messaging-types'
import { IAction, ActionStatus, ActionType } from '@komgo/types'
import { injectable } from 'inversify'

import { ActionDataAgent } from '../../data-layer/data-agents/ActionDataAgent'
import DatabaseError from '../../data-layer/data-agents/DatabaseError'
import FailedProcessActionError from '../errors/FailedProcessActionError'
import InternalPublisher from '../messaging/InternalPublisher'
import { IRFPActionMessage, IActionPayload } from '../messaging/types'
import { buildInternalRoutingKey } from '../messaging/utils'
import { getProductName } from '../utils'
import { RFPValidator } from '../validation/RFPValidator'

const REDACTED_CONTENT = '[redacted]'

@injectable()
export default abstract class AbstractReceiveInboundUseCase {
  constructor(
    protected readonly logger: LogstashCapableLogger,
    protected readonly actionDataAgent: ActionDataAgent,
    protected readonly rfpValidator: RFPValidator,
    private readonly internalPublisher: InternalPublisher
  ) {}

  public async execute(rfpMessage: IRFPActionMessage<IActionPayload>, actionType: ActionType) {
    this.logger.info('Received rfp message', { actionType, rfpContext: rfpMessage.context })
    await this.rfpValidator.validateSenderDetails(rfpMessage.data.rfp.senderStaticID)
    await this.createOrValidateRFP(rfpMessage, actionType)
    try {
      const action: IAction = await this.saveAction(rfpMessage, actionType)
      await this.sendInternalMessage(rfpMessage, actionType)
      await this.validateProductId(rfpMessage)
      await this.updateActionStatus(rfpMessage.data.rfp.rfpId, action, ActionStatus.Processed)
    } catch (error) {
      this.handleError(error)
    }
  }

  protected abstract createOrValidateRFP(
    rfpMessage: IRFPActionMessage<IActionPayload>,
    actionType: ActionType
  ): Promise<void>

  protected abstract createAction(actionPayload: IActionPayload, ActionType: ActionType): IAction

  protected abstract createInternalMessage(rfpMessage: IRFPActionMessage<IActionPayload>): IRFPMessage<IRFPPayload>

  protected createRoutingKey(context: string, actionType: ActionType): string {
    return buildInternalRoutingKey(actionType, context)
  }

  protected handleError(error: any) {
    if (error instanceof DatabaseError && error.errorCode === ErrorCode.DatabaseInvalidData) {
      throw new FailedProcessActionError(error.message)
    } else {
      throw error
    }
  }

  private validateProductId(rfpMessage: IRFPActionMessage<IActionPayload>) {
    return getProductName(rfpMessage.context.subProductId)
  }

  private async saveAction(rfpMessage: IRFPActionMessage<IActionPayload>, actionType: ActionType): Promise<IAction> {
    const savedAction = await this.actionDataAgent.updateCreate(this.createAction(rfpMessage.data, actionType))
    this.logger.info('Received and Saved RFP Action', {
      action: { ...savedAction, _id: REDACTED_CONTENT, data: REDACTED_CONTENT }
    })
    return savedAction
  }

  private async sendInternalMessage(rfpMessage: IRFPActionMessage<IActionPayload>, actionType: ActionType) {
    const rfpId = rfpMessage.data.rfp.rfpId
    const message = this.createInternalMessage(rfpMessage)
    const messageId: string = await this.internalPublisher.send(
      this.createRoutingKey(rfpMessage.context, actionType),
      message
    )
    this.logger.info('Internal message sent', {
      message: { ...message, data: REDACTED_CONTENT },
      messageId,
      rfpId
    })
  }

  private async updateActionStatus(rfpStaticId: string, action: IAction, status: ActionStatus) {
    await this.actionDataAgent.updateStatus(action.staticId, status, action.sentAt)
    this.logger.info('Action processed', {
      rfpId: rfpStaticId,
      actionId: action.staticId,
      actioType: action.type
    })
  }
}
