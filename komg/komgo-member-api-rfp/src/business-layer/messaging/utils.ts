import { ActionType } from '@komgo/types'

import { OUTBOUND_MESSAGE_TYPE_PREFIX, INTERNAL_MESSAGE_TYPE_PREFIX } from './constants'
import InvalidMessageTypeError from './InvalidMessageTypeError'

export const buildMessageType = (actionType: ActionType): string => {
  return OUTBOUND_MESSAGE_TYPE_PREFIX + actionType.toString()
}

export const getActionType = (messageType: string): ActionType => {
  if (messageType === buildMessageType(ActionType.Request)) {
    return ActionType.Request
  } else if (messageType === buildMessageType(ActionType.Response)) {
    return ActionType.Response
  } else if (messageType === buildMessageType(ActionType.Reject)) {
    return ActionType.Reject
  } else if (messageType === buildMessageType(ActionType.Accept)) {
    return ActionType.Accept
  } else if (messageType === buildMessageType(ActionType.Decline)) {
    return ActionType.Decline
  } else {
    throw new InvalidMessageTypeError(`Invalid messageType=${messageType}`)
  }
}

export const buildInternalRoutingKey = (actionType: ActionType, context: any): string => {
  return `${INTERNAL_MESSAGE_TYPE_PREFIX}${context.productId}.${context.subProductId}.${actionType.toString()}`
}
