import { getLogger } from '@komgo/logging'
import { IRequestForProposalBase, IRequestForProposal, IActionBase, ActionType, ActionStatus } from '@komgo/types'
import { injectable, inject } from 'inversify'

import { ActionDataAgent } from '../../../data-layer/data-agents/ActionDataAgent'
import { RequestForProposalDataAgent } from '../../../data-layer/data-agents/RequestForProposalDataAgent'
import { TYPES } from '../../../inversify/types'
import { VALUES } from '../../../inversify/values'
import { saveAction } from '../../actions/actionUtils'
import SaveEntityError from '../../errors/SaveEntityError'

@injectable()
export class CreateRequestUseCase {
  private logger = getLogger('CreateRequestUseCase')
  constructor(
    @inject(TYPES.RequestForProposalDataAgent) private readonly rfpDataAgent: RequestForProposalDataAgent,
    @inject(TYPES.ActionDataAgent) private readonly actionDataAgent: ActionDataAgent,
    @inject(VALUES.CompanyStaticId) private companyStaticId: string
  ) {}

  public async execute(rfpBase: IRequestForProposalBase, participantIds: string[]): Promise<string> {
    const savedRfp = await this.saveRFP(rfpBase)

    for (const recipientId of participantIds) {
      const action = this.createActionBase(savedRfp.staticId, recipientId)
      await saveAction(action, this.actionDataAgent, this.logger)
    }
    return savedRfp.staticId
  }

  private async saveRFP(rfpBase: IRequestForProposalBase): Promise<IRequestForProposal> {
    try {
      return await this.rfpDataAgent.create(rfpBase)
    } catch (error) {
      throw new SaveEntityError(`Unable to save RFP ${rfpBase.context}`)
    }
  }

  private createActionBase(rfpId: string, id: string): IActionBase {
    return {
      rfpId,
      recipientStaticID: id,
      senderStaticID: this.companyStaticId,
      type: ActionType.Request,
      status: ActionStatus.Created
    }
  }
}
