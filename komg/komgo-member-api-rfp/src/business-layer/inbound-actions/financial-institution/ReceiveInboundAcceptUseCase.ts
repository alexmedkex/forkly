import { getLogger } from '@komgo/logging'
import { IRFPMessage, IRFPPayload } from '@komgo/messaging-types'
import { ActionType, ActionStatus, IAction } from '@komgo/types'
import { inject, injectable } from 'inversify'

import { ActionDataAgent } from '../../../data-layer/data-agents/ActionDataAgent'
import { TYPES } from '../../../inversify/types'
import { VALUES } from '../../../inversify/values'
import { createReplyActionFromPayload } from '../../actions/actionUtils'
import InternalMessageFactory from '../../messaging/InternalMessageFactory'
import InternalPublisher from '../../messaging/InternalPublisher'
import { IRFPActionMessage, IResponsePayload } from '../../messaging/types'
import { RFPValidator } from '../../validation/RFPValidator'
import AbstractReceiveInboundUseCase from '../AbstractReceiveInboundUseCase'

@injectable()
export class ReceiveInboundAcceptUseCase extends AbstractReceiveInboundUseCase {
  constructor(
    @inject(TYPES.ActionDataAgent) actionDataAgent: ActionDataAgent,
    @inject(TYPES.InternalPublisher) internalPublisher: InternalPublisher,
    @inject(TYPES.RFPValidator) protected readonly rfpValidator: RFPValidator,
    @inject(TYPES.InternalMessageFactory) protected readonly internalMessageFactory: InternalMessageFactory,
    @inject(VALUES.CompanyStaticId) private readonly companyStaticId: string
  ) {
    super(getLogger('ReceiveInboundAcceptUseCase'), actionDataAgent, rfpValidator, internalPublisher)
  }

  protected createAction(payload: IResponsePayload, actionType: ActionType): IAction {
    return createReplyActionFromPayload(payload, actionType)
  }

  protected createInternalMessage(rfpMessage: IRFPActionMessage<IResponsePayload>): IRFPMessage<IRFPPayload> {
    return this.internalMessageFactory.createReply(rfpMessage.data, rfpMessage.context)
  }

  protected async createOrValidateRFP(rfpMessage: IRFPActionMessage<IResponsePayload>, actionType: ActionType) {
    const { rfpId, senderStaticID, actionId } = rfpMessage.data.rfp
    await this.rfpValidator.validateRFPExists(rfpId)
    await this.validateResponseSent(rfpId)
    await this.validateRejectNotSent(rfpId)
    await this.validateAcceptOrDeclineNotReceived(rfpId, senderStaticID)
    await this.rfpValidator.validateActionStatus(actionId)
  }

  private async validateResponseSent(rfpId: string) {
    await this.rfpValidator.validateActionTypeExistsFromParticipant(
      rfpId,
      ActionType.Response,
      ActionStatus.Processed,
      this.companyStaticId
    )
  }

  private async validateRejectNotSent(rfpId: string) {
    await this.rfpValidator.validateActionTypesNotReceivedFromParticipant(
      rfpId,
      [ActionType.Reject],
      this.companyStaticId
    )
  }

  private async validateAcceptOrDeclineNotReceived(rfpId: string, participantStaticId: string) {
    await this.rfpValidator.validateActionTypesNotReceivedFromParticipant(
      rfpId,
      [ActionType.Accept, ActionType.Decline],
      participantStaticId
    )
  }
}
