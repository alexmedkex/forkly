import { ErrorCode } from '@komgo/error-utilities'
import { LogstashCapableLogger } from '@komgo/logging'
import { IAction, IActionBase, ActionStatus, ActionType } from '@komgo/types'

import { ActionDataAgent } from '../../data-layer/data-agents/ActionDataAgent'
import { ErrorName } from '../../ErrorName'
import SaveEntityError from '../errors/SaveEntityError'
import { IResponsePayload } from '../messaging/types'

export async function saveAction(
  action: IActionBase,
  actionDataAgent: ActionDataAgent,
  logger: LogstashCapableLogger
): Promise<IAction> {
  const actionLog = action.data ? { ...action, data: '[redacted]' } : action
  try {
    const savedAction = await actionDataAgent.create(action)
    logger.info('Saved RFP Action', actionLog)
    return savedAction
  } catch (error) {
    logger.error(ErrorCode.ConnectionDatabase, ErrorName.SaveRFPActionError, {
      action: actionLog,
      errorMessage: error.errorMessage
    })
    throw new SaveEntityError(
      `Unable to save RFP Action ${action.type} for recipient ${action.recipientStaticID} with RPF ID ${action.rfpId}`
    )
  }
}

export function createReplyActionFromPayload(payload: IResponsePayload, actionType: ActionType): IAction {
  return {
    staticId: payload.rfp.actionId,
    recipientStaticID: payload.rfp.recipientStaticID,
    senderStaticID: payload.rfp.senderStaticID,
    rfpId: payload.rfp.rfpId,
    sentAt: payload.rfp.sentAt,
    status: ActionStatus.Created,
    type: actionType,
    data: payload.response
  }
}
