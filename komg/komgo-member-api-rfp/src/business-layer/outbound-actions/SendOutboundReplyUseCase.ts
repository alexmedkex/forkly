import { getLogger } from '@komgo/logging'
import { ActionType, IOutboundActionResult, IRequestForProposal, IAction, ActionStatus } from '@komgo/types'
import { injectable, inject } from 'inversify'

import { TYPES } from '../../inversify/types'
import { OutboundActionProcessor } from '../actions/OutboundActionProcessor'
import FailedProcessReplyActionError from '../errors/FailedProcessReplyActionError'
import { RFPValidator } from '../validation/RFPValidator'

@injectable()
export default class SendOutboundReplyUseCase {
  private readonly logger = getLogger('SendOutboundReplyUseCase')

  constructor(
    @inject(TYPES.RFPValidator) private readonly rfpValidator: RFPValidator,
    @inject(TYPES.OutboundActionProcessor) private readonly actionProcessor: OutboundActionProcessor
  ) {}

  /**
   * Send RFP response to another Komgo member
   */
  public async execute(rfpId: string, actionType: ActionType): Promise<IOutboundActionResult> {
    this.logger.info(`Sending outbound ${actionType.toString()} action for rfpId - ${rfpId}`)
    const rfp: IRequestForProposal = await this.rfpValidator.validateRFPExists(rfpId)

    // ensure we have the latest response in case it is a retry for one that failed
    const action: IAction = await this.rfpValidator.validateLatestActionExists(rfpId, actionType, ActionStatus.Created)

    return this.processAction(action, rfp)
  }

  private async processAction(action: IAction, rfp: IRequestForProposal) {
    const result: IOutboundActionResult = await this.actionProcessor.processAction(rfp, action)
    if (result.status === ActionStatus.Failed) {
      throw new FailedProcessReplyActionError(`Failed to process ${action.type.toString()} action ${action.staticId}`)
    }
    return result
  }
}
