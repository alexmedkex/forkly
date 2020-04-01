import { ErrorCode } from '@komgo/error-utilities'
import { getLogger } from '@komgo/logging'
import { IRequestForProposal, IAction, ActionType } from '@komgo/types'
import { injectable } from 'inversify'

import { ErrorName } from '../../ErrorName'

import { OUTBOUND_MESSAGE_VERSION } from './constants'
import InvalidActionTypeError from './InvalidActionTypeError'
import OutboundMessageCreateError from './OutboundMessageCreateError'
import { IRFPActionMessage, IRequestPayload, IResponsePayload, IActionPayload } from './types'
import { buildMessageType } from './utils'

@injectable()
export default class OutboundMessageFactory {
  private readonly logger = getLogger('OutboundMessageFactory')

  public createMessage(rfp: IRequestForProposal, action: IAction): IRFPActionMessage<IActionPayload> {
    this.validateActionMatchesRFP(rfp, action)
    const messagePayload: IActionPayload = this.createRFPMessagePayload(action, rfp)
    return this.createIRFPMessage(rfp, messagePayload, action.type)
  }

  private validateActionMatchesRFP(rfp: IRequestForProposal, action: IAction) {
    if (rfp.staticId !== action.rfpId) {
      this.logger.error(ErrorCode.DatabaseInvalidData, ErrorName.OutboundMessageRFPIdActionMissmatchError, {
        actionRfpId: action.rfpId,
        rfpId: rfp.staticId
      })
      throw new OutboundMessageCreateError(`rfp.staticId=${rfp.staticId} doesn't match action.rfpId=${action.rfpId}`)
    }
  }

  private createRFPMessagePayload(action: IAction, rfp: IRequestForProposal) {
    if (action.type === ActionType.Request) {
      return this.createRequestPayload(rfp, action)
    } else if (this.isReplyActionType(action)) {
      return this.createReplyPayload(rfp, action)
    } else {
      throw new InvalidActionTypeError(`Unable to create outbound message for ActionType - ${action.type}`)
    }
  }

  private isReplyActionType(action: IAction) {
    return (
      action.type === ActionType.Response ||
      action.type === ActionType.Reject ||
      action.type === ActionType.Accept ||
      action.type === ActionType.Decline
    )
  }

  /**
   * Create outbound RFP Request payload
   */
  private createRequestPayload(rfp: IRequestForProposal, action: IAction): IActionPayload {
    const data: IRequestPayload = {
      rfp: {
        actionId: action.staticId,
        rfpId: rfp.staticId,
        recipientStaticID: action.recipientStaticID,
        senderStaticID: action.senderStaticID,
        sentAt: new Date().toISOString()
      },
      productRequest: rfp.productRequest,
      documentIds: rfp.documentIds
    }
    return data
  }

  /**
   * Create outbound RFP Response or Reject payload
   */
  private createReplyPayload(rfp: IRequestForProposal, action: IAction): IResponsePayload {
    const data: IResponsePayload = {
      rfp: {
        actionId: action.staticId,
        rfpId: rfp.staticId,
        recipientStaticID: action.recipientStaticID,
        senderStaticID: action.senderStaticID,
        sentAt: new Date().toISOString()
      },
      response: action.data
    }
    return data
  }

  private createIRFPMessage(
    rfp: IRequestForProposal,
    data: IActionPayload,
    actionType: ActionType
  ): IRFPActionMessage<IActionPayload> {
    return {
      version: OUTBOUND_MESSAGE_VERSION,
      context: rfp.context,
      messageType: buildMessageType(actionType),
      data
    }
  }
}
