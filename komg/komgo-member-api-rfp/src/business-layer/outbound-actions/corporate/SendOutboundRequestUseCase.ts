import { ErrorCode } from '@komgo/error-utilities'
import { getLogger } from '@komgo/logging'
import { IRequestForProposal, IOutboundActionResult, IAction, ActionType, ActionStatus } from '@komgo/types'
import { injectable, inject } from 'inversify'

import { ActionDataAgent } from '../../../data-layer/data-agents/ActionDataAgent'
import { RequestForProposalDataAgent } from '../../../data-layer/data-agents/RequestForProposalDataAgent'
import { ErrorName } from '../../../ErrorName'
import { TYPES } from '../../../inversify/types'
import { OutboundActionProcessor } from '../../actions/OutboundActionProcessor'
import FailedProcessRequestActionsError from '../../errors/FailedProcessRequestActionsError'
import NoActionsForRequestError from '../../errors/NoActionsForRequestError'

@injectable()
export default class SendOutboundRequestUseCase {
  private readonly logger = getLogger('SendOutboundRequestUseCase')

  constructor(
    @inject(TYPES.ActionDataAgent) private readonly actionDataAgent: ActionDataAgent,
    @inject(TYPES.RequestForProposalDataAgent)
    private readonly requestForProposalDataAgent: RequestForProposalDataAgent,
    @inject(TYPES.OutboundActionProcessor) private readonly actionProcessor: OutboundActionProcessor
  ) {}

  /**
   * Send RFP message to another Komgo member
   */
  public async execute(rfpId: string): Promise<IOutboundActionResult[]> {
    const rfp: IRequestForProposal = await this.requestForProposalDataAgent.findOneByStaticId(rfpId)
    const actions: IAction[] = await this.actionDataAgent.findByRFPIdAndActionType(
      rfpId,
      ActionType.Request,
      ActionStatus.Created
    )

    if (actions.length === 0) {
      this.logger.error(ErrorCode.UnexpectedError, ErrorName.NoActionsForRequestError, {
        rfpId
      })
      throw new NoActionsForRequestError('No Request actions in Created status available', rfpId)
    }

    const processResult: IOutboundActionResult[] = await this.actionProcessor.processActions(rfp, actions)

    if (processResult.filter(actionResult => actionResult.status === ActionStatus.Processed).length === 0) {
      throw new FailedProcessRequestActionsError('Unable to process any of the actions', rfpId)
    }

    return processResult
  }
}
