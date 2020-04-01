import { ActionType, IAction } from '@komgo/types'
import { injectable } from 'inversify'

import { ActionDataAgent } from '../data-layer/data-agents/ActionDataAgent'
import { RequestForProposalDataAgent } from '../data-layer/data-agents/RequestForProposalDataAgent'
import { inject } from '../inversify/ioc'
import { TYPES } from '../inversify/types'

import RFPNotFoundError from './errors/RFPNotFoundError'

@injectable()
export class GetActionsUseCase {
  constructor(
    @inject(TYPES.ActionDataAgent) private readonly actionDataAgent: ActionDataAgent,
    @inject(TYPES.RequestForProposalDataAgent) private rfpDataAgent: RequestForProposalDataAgent
  ) {}

  public async execute(rfpId: string, actionType: ActionType): Promise<IAction[]> {
    const rfp = await this.rfpDataAgent.findOneByStaticId(rfpId)
    if (!rfp) {
      throw new RFPNotFoundError(`RFP with ${rfpId} does not exist`, rfpId)
    }
    const actions = await this.actionDataAgent.findByRFPIdAndActionType(rfpId, actionType)
    return actions
  }
}
