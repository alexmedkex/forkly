import { getLogger } from '@komgo/logging'
import { ActionType } from '@komgo/types'
import { injectable, inject } from 'inversify'

import { ActionDataAgent } from '../../../data-layer/data-agents/ActionDataAgent'
import { TYPES } from '../../../inversify/types'
import { ActionFactory } from '../../actions/ActionFactory'
import { saveAction } from '../../actions/actionUtils'
import { RFPValidator } from '../../validation/RFPValidator'

@injectable()
export class CreateAcceptUseCase {
  private logger = getLogger('CreateAcceptUseCase')
  constructor(
    @inject(TYPES.ActionDataAgent) private readonly actionDataAgent: ActionDataAgent,
    @inject(TYPES.ActionFactory) private readonly actionFactory: ActionFactory,
    @inject(TYPES.RFPValidator) private readonly rfpValidator: RFPValidator
  ) {}

  /**
   * @throws InvalidActionReplyError when it is not possible to accept the RFP
   */
  public async execute(rfpId: string, responseData: any, participantStaticId: string): Promise<string> {
    this.logger.info(`Creating ${ActionType.Accept.toString()} action for RFP`, {
      rfpId,
      actionType: ActionType.Accept
    })
    await this.rfpValidator.validateRFPExists(rfpId)
    await this.rfpValidator.validateOutboundAcceptAllowed(rfpId, participantStaticId)

    const responseAction = this.actionFactory.createActionBase(
      rfpId,
      ActionType.Accept,
      participantStaticId,
      responseData
    )
    const savedAction = await saveAction(responseAction, this.actionDataAgent, this.logger)
    return savedAction.staticId
  }
}
