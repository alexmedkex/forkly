import { getLogger } from '@komgo/logging'
import { ActionType, ActionStatus } from '@komgo/types'
import { injectable, inject } from 'inversify'

import { ActionDataAgent } from '../../../data-layer/data-agents/ActionDataAgent'
import { TYPES } from '../../../inversify/types'
import { ActionFactory } from '../../actions/ActionFactory'
import { saveAction } from '../../actions/actionUtils'
import { RFPValidator } from '../../validation/RFPValidator'

@injectable()
export class CreateFinancialInstitutionReplyUseCase {
  private logger = getLogger('CreateFinancialInstitutionReplyUseCase')
  constructor(
    @inject(TYPES.ActionDataAgent) private readonly actionDataAgent: ActionDataAgent,
    @inject(TYPES.ActionFactory) private readonly actionFactory: ActionFactory,
    @inject(TYPES.RFPValidator) private readonly rfpValidator: RFPValidator
  ) {}

  /**
   * @throws InvalidActionReplyError when the RFP can't have a reply of this ActionType
   */
  public async execute(rfpId: string, actionType: ActionType, responseData: any): Promise<string> {
    this.logger.info(`Creating ${actionType.toString()} action for RFP`, { rfpId, actionType })
    await this.rfpValidator.validateRFPExists(rfpId)
    await this.rfpValidator.validateOutboundReplyAllowed(rfpId, actionType)

    const responseRecipient = await this.getRecipient(rfpId)
    const responseAction = this.actionFactory.createActionBase(rfpId, actionType, responseRecipient, responseData)
    const savedAction = await saveAction(responseAction, this.actionDataAgent, this.logger)
    return savedAction.staticId
  }

  private async getRecipient(rfpId: string) {
    const latestRequestAction = await this.rfpValidator.validateLatestActionExists(
      rfpId,
      ActionType.Request,
      ActionStatus.Processed
    )
    return latestRequestAction.senderStaticID
  }
}
