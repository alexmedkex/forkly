import { ErrorCode } from '@komgo/error-utilities'
import { getLogger } from '@komgo/logging'
import { IRequestForProposal, IAction, IOutboundActionResult, ActionStatus } from '@komgo/types'
import { inject, injectable } from 'inversify'

import { ActionDataAgent } from '../../data-layer/data-agents/ActionDataAgent'
import { ErrorName } from '../../ErrorName'
import { TYPES } from '../../inversify/types'
import OutboundMessageFactory from '../messaging/OutboundMessageFactory'
import OutboundPublisher from '../messaging/OutboundPublisher'
import { IRFPActionMessage, IActionPayload } from '../messaging/types'

@injectable()
export class OutboundActionProcessor {
  private readonly logger = getLogger('OutboundActionProcessor')

  constructor(
    @inject(TYPES.OutboundPublisher) private readonly outboundPublisher: OutboundPublisher,
    @inject(TYPES.OutboundMessageFactory) private readonly outboundMessageFactory: OutboundMessageFactory,
    @inject(TYPES.ActionDataAgent) private readonly actionDataAgent: ActionDataAgent
  ) {}

  public async processActions(rfp: IRequestForProposal, actions: IAction[]): Promise<IOutboundActionResult[]> {
    const result: IOutboundActionResult[] = []

    for (const action of actions) {
      const publishActionResult = await this.processAction(rfp, action)
      result.push(publishActionResult)
    }
    this.logger.info(`Actions processing finished`, {
      actionStatuses: result
    })
    return result
  }

  public async processAction(rfp: IRequestForProposal, action: IAction): Promise<IOutboundActionResult> {
    let message: IRFPActionMessage<IActionPayload>
    let processed = false
    let sentAt
    try {
      message = this.outboundMessageFactory.createMessage(rfp, action)
      sentAt = message.data.rfp.sentAt
      const messageId = await this.outboundPublisher.send(action.recipientStaticID, message)
      this.logPublishedMessage(action, messageId, message)
      processed = true
    } catch (error) {
      this.logError(message, action, error)
    }
    const actionStatus = processed ? ActionStatus.Processed : ActionStatus.Failed
    await this.actionDataAgent.updateStatus(action.staticId, actionStatus, sentAt)
    return { recipientStaticId: action.recipientStaticID, status: actionStatus }
  }

  private logPublishedMessage(action: IAction, messageId: string, message: IRFPActionMessage<IActionPayload>) {
    this.logger.info(`Message sent to recipient ${action.recipientStaticID} with messageId=${messageId}`, {
      rfpMessage: { ...message, rfpData: message.data.rfp, data: '[redacted]' }
    })
  }

  private logError(message: IRFPActionMessage<IActionPayload>, action: IAction, error: any) {
    const rfpMessage = message ? { ...message, data: '[redacted]' } : {}
    this.logger.warn(
      ErrorCode.ConnectionInternalMQ,
      ErrorName.SendOutboundActionFailed,
      `Failed to publish action to recipient ${action.recipientStaticID}`,
      {
        errorMessage: error.message,
        rfpMessage,
        actionType: action.type
      }
    )
  }
}
