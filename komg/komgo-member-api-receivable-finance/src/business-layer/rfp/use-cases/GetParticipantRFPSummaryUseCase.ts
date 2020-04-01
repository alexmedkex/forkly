import { getLogger } from '@komgo/logging'
import { IParticipantRFPSummary } from '@komgo/types'
import { injectable, inject } from 'inversify'

import { ReplyDataAgent } from '../../../data-layer/data-agents'
import { TYPES } from '../../../inversify'
import { EntityNotFoundError } from '../../errors'
import { RDInfoAggregator } from '../../rd/RDInfoAggregator'
import { RFPValidator } from '../../validation'

@injectable()
export class GetParticipantRFPSummaryUseCase {
  private readonly logger = getLogger('GetParticipantRFPSummaryUseCase')

  constructor(
    @inject(TYPES.RFPValidator) private readonly rfpValidator: RFPValidator,
    @inject(TYPES.ReplyDataAgent) private readonly replyDataAgent: ReplyDataAgent,
    @inject(TYPES.RDInfoAggregator) private readonly rDInfoAggregator: RDInfoAggregator
  ) {}

  public async execute(rdId: string, participantId: string): Promise<IParticipantRFPSummary> {
    this.logger.info(`Getting RFP summary for rdId: ${rdId} and participantId: ${participantId}`)

    const rfp = await this.rfpValidator.validateRFPExistsByRdId(rdId)
    this.logger.info(`Retrieved RFP with id: ${rfp.rfpId} and participantId: ${participantId}`)

    const replies = await this.replyDataAgent.findAllByRdId(rdId, participantId)
    if (replies.length === 0) {
      throw new EntityNotFoundError('No replies for this participantId')
    }

    const summaries: IParticipantRFPSummary[] = await this.rDInfoAggregator.createParticipantRFPSummaries(
      [participantId],
      replies
    )
    if (summaries.length === 0) {
      throw new EntityNotFoundError('No summaries for this participantId')
    }
    return summaries[0]
  }
}
