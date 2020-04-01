import { getLogger } from '@komgo/logging'
import { IRFPMessage, IRFPPayload } from '@komgo/messaging-types'
import { ActionType, IAction } from '@komgo/types'
import { injectable, inject } from 'inversify'

import { ActionDataAgent } from '../../../data-layer/data-agents/ActionDataAgent'
import { TYPES } from '../../../inversify/types'
import { createReplyActionFromPayload } from '../../actions/actionUtils'
import InternalMessageFactory from '../../messaging/InternalMessageFactory'
import InternalPublisher from '../../messaging/InternalPublisher'
import { IRFPActionMessage, IResponsePayload } from '../../messaging/types'
import { RFPValidator } from '../../validation/RFPValidator'
import AbstractReceiveInboundUseCase from '../AbstractReceiveInboundUseCase'

@injectable()
export default class ReceiveInboundCorporateReplyUseCase extends AbstractReceiveInboundUseCase {
  constructor(
    @inject(TYPES.ActionDataAgent) actionDataAgent: ActionDataAgent,
    @inject(TYPES.InternalPublisher) internalPublisher: InternalPublisher,
    @inject(TYPES.RFPValidator) protected readonly rfpValidator: RFPValidator,
    @inject(TYPES.InternalMessageFactory) private readonly internalMessageFactory: InternalMessageFactory
  ) {
    super(getLogger('ReceiveInboundCorporateReplyUseCase'), actionDataAgent, rfpValidator, internalPublisher)
  }

  protected async createOrValidateRFP(rfpMessage: IRFPActionMessage<IResponsePayload>, actionType: ActionType) {
    await this.rfpValidator.validateRFPExists(rfpMessage.data.rfp.rfpId)
    await this.rfpValidator.validateInboundReplyAllowed(
      rfpMessage.data.rfp.rfpId,
      actionType,
      rfpMessage.data.rfp.senderStaticID
    )
    await this.rfpValidator.validateActionStatus(rfpMessage.data.rfp.actionId)
  }

  protected createAction(payload: IResponsePayload, actionType: ActionType): IAction {
    return createReplyActionFromPayload(payload, actionType)
  }

  protected createInternalMessage(rfpMessage: IRFPActionMessage<IResponsePayload>): IRFPMessage<IRFPPayload> {
    return this.internalMessageFactory.createReply(rfpMessage.data, rfpMessage.context)
  }
}
