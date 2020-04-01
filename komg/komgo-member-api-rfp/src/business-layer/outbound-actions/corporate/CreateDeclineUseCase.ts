import { getLogger } from '@komgo/logging'
import { ActionType } from '@komgo/types'
import { injectable, inject } from 'inversify'

import { ActionDataAgent } from '../../../data-layer/data-agents/ActionDataAgent'
import { TYPES } from '../../../inversify/types'
import { ActionFactory } from '../../actions/ActionFactory'
import { saveAction } from '../../actions/actionUtils'
import { RFPValidator } from '../../validation/RFPValidator'

@injectable()
export class CreateDeclineUseCase {
  private logger = getLogger('CreateDeclineUseCase')
  constructor(
    @inject(TYPES.ActionDataAgent) private readonly actionDataAgent: ActionDataAgent,
    @inject(TYPES.ActionFactory) private readonly actionFactory: ActionFactory,
    @inject(TYPES.RFPValidator) private readonly rfpValidator: RFPValidator
  ) {}

  /**
   * @throws InvalidActionReplyError when it is not possible to Decline the RFP
   */
  public async execute(rfpId: string, participantStaticId: string, responseData?: any): Promise<string> {
    const targetActionType = ActionType.Decline

    this.logger.info(`Creating ${targetActionType.toString()} action for RFP`, {
      rfpId,
      actionType: targetActionType,
      participantStaticId
    })
    await this.rfpValidator.validateRFPExists(rfpId)
    await this.rfpValidator.validateRejectNotReceivedFromParticipant(rfpId, participantStaticId)
    await this.rfpValidator.validateActionTypeNotSentToParticipant(rfpId, targetActionType, participantStaticId)
    await this.rfpValidator.validateActionTypeNotSentToParticipant(rfpId, ActionType.Accept, participantStaticId)

    const responseAction = this.actionFactory.createActionBase(
      rfpId,
      targetActionType,
      participantStaticId,
      responseData
    )
    const savedAction = await saveAction(responseAction, this.actionDataAgent, this.logger)
    return savedAction.staticId
  }
}
