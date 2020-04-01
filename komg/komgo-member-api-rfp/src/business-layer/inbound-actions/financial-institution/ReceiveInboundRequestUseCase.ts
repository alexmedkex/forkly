import { getLogger } from '@komgo/logging'
import { IRFPMessage, IRFPPayload } from '@komgo/messaging-types'
import { ActionType, IAction, ActionStatus, IRequestForProposal } from '@komgo/types'
import { injectable, inject } from 'inversify'

import { ActionDataAgent } from '../../../data-layer/data-agents/ActionDataAgent'
import { RequestForProposalDataAgent } from '../../../data-layer/data-agents/RequestForProposalDataAgent'
import { TYPES } from '../../../inversify/types'
import InternalMessageFactory from '../../messaging/InternalMessageFactory'
import InternalPublisher from '../../messaging/InternalPublisher'
import { IRFPActionMessage, IRequestPayload } from '../../messaging/types'
import { RFPValidator } from '../../validation/RFPValidator'
import AbstractReceiveInboundUseCase from '../AbstractReceiveInboundUseCase'
const REDACTED_CONTENT = '[redacted]'

@injectable()
export default class ReceiveInboundRequestUseCase extends AbstractReceiveInboundUseCase {
  constructor(
    @inject(TYPES.ActionDataAgent) actionDataAgent: ActionDataAgent,
    @inject(TYPES.InternalPublisher) internalPublisher: InternalPublisher,
    @inject(TYPES.RFPValidator) protected readonly rfpValidator: RFPValidator,
    @inject(TYPES.InternalMessageFactory) private readonly internalMessageFactory: InternalMessageFactory,
    @inject(TYPES.RequestForProposalDataAgent)
    private readonly requestForProposalDataAgent: RequestForProposalDataAgent
  ) {
    super(getLogger('ReceiveInboundRequestUseCase'), actionDataAgent, rfpValidator, internalPublisher)
  }

  protected async createOrValidateRFP(rfpMessage: IRFPActionMessage<IRequestPayload>) {
    await this.saveRequestForProposal(rfpMessage)
    await this.rfpValidator.validateActionStatus(rfpMessage.data.rfp.actionId)
  }

  protected createAction(payload: IRequestPayload, actionType: ActionType): IAction {
    return {
      staticId: payload.rfp.actionId,
      recipientStaticID: payload.rfp.recipientStaticID,
      senderStaticID: payload.rfp.senderStaticID,
      rfpId: payload.rfp.rfpId,
      sentAt: payload.rfp.sentAt,
      status: ActionStatus.Created,
      type: actionType
    }
  }

  protected createInternalMessage(rfpMessage: IRFPActionMessage<IRequestPayload>): IRFPMessage<IRFPPayload> {
    return this.internalMessageFactory.createRequest(rfpMessage.data, rfpMessage.context)
  }

  private async saveRequestForProposal(rfpMessage: IRFPActionMessage<IRequestPayload>): Promise<IRequestForProposal> {
    const requestForProposal: IRequestForProposal = {
      staticId: rfpMessage.data.rfp.rfpId,
      context: rfpMessage.context,
      productRequest: rfpMessage.data.productRequest,
      documentIds: rfpMessage.data.documentIds
    }
    const savedRfp = await this.requestForProposalDataAgent.updateCreate(requestForProposal)
    this.logger.info('Received and Saved RFP', {
      rfp: { ...savedRfp, data: REDACTED_CONTENT, _id: REDACTED_CONTENT }
    })
    return savedRfp
  }
}
