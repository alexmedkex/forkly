import { getLogger } from '@komgo/logging'
import { ActionType, IOutboundActionResult, IRequestForProposal, IAction, ActionStatus } from '@komgo/types'
import { injectable, inject } from 'inversify'

import { ActionDataAgent } from '../../../data-layer/data-agents/ActionDataAgent'
import { TYPES } from '../../../inversify/types'
import { OutboundActionProcessor } from '../../actions/OutboundActionProcessor'
import { RFPValidator } from '../../validation/RFPValidator'

import { CreateDeclineUseCase } from './CreateDeclineUseCase'

@injectable()
export class AutoDeclineUseCase {
  private readonly logger = getLogger('AutoDeclineUseCase')

  constructor(
    @inject(TYPES.RFPValidator) private readonly rfpValidator: RFPValidator,
    @inject(TYPES.OutboundActionProcessor) private readonly actionProcessor: OutboundActionProcessor,
    @inject(TYPES.ActionDataAgent) private readonly actionDataAgent: ActionDataAgent,
    @inject(TYPES.CreateDeclineUseCase) private readonly createDeclineUseCase: CreateDeclineUseCase
  ) {}

  /**
   * Send RFP response to another Komgo member
   */
  public async execute(rfpId: string): Promise<IOutboundActionResult[]> {
    this.logger.info(`Auto-Decline rfpId - ${rfpId}`, {
      rfpId
    })
    const rfp: IRequestForProposal = await this.rfpValidator.validateRFPExists(rfpId)

    const requestActions: IAction[] = await this.actionDataAgent.findActionsByRFPIdAndActionTypes(rfpId, [
      ActionType.Request
    ])
    const rejectActions: IAction[] = await this.actionDataAgent.findActionsByRFPIdAndActionTypes(rfpId, [
      ActionType.Reject
    ])
    const acceptAndDeclinedActions: IAction[] = await this.actionDataAgent.findActionsByRFPIdAndActionTypes(rfpId, [
      ActionType.Accept,
      ActionType.Decline
    ])

    const requestedFinancialInstitutions: string[] = requestActions.map(a => a.recipientStaticID)
    const rejectedFinancialInstitutions: string[] = rejectActions.map(a => a.senderStaticID)
    const acceptedAndDeclinedFinancialInstitutions: string[] = acceptAndDeclinedActions.map(a => a.recipientStaticID)

    const financialInstitutionsToDecline: string[] = requestedFinancialInstitutions
      .filter(staticId => !rejectedFinancialInstitutions.includes(staticId))
      .filter(staticId => !acceptedAndDeclinedFinancialInstitutions.includes(staticId))

    this.logger.info(`Creating Auto-Decline actions`, {
      rfpId,
      requestedFinancialInstitutions,
      rejectedFinancialInstitutions,
      acceptedOrDeclinedFinancialInstitutions: acceptedAndDeclinedFinancialInstitutions,
      recipientFinancialInstitutionsToDecline: financialInstitutionsToDecline
    })

    for (const participantStaticId of financialInstitutionsToDecline) {
      await this.createDeclineUseCase.execute(rfpId, participantStaticId)
    }

    const actions: IAction[] = await this.actionDataAgent.findByRFPIdAndActionType(
      rfpId,
      ActionType.Decline,
      ActionStatus.Created
    )

    return this.actionProcessor.processActions(rfp, actions)
  }
}
