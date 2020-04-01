import { getLogger } from '@komgo/logging'
import { IParticipantRFPSummary } from '@komgo/types'
import { injectable, inject } from 'inversify'

import { ReplyDataAgent } from '../../../data-layer/data-agents'
import { TYPES } from '../../../inversify'
import { RDInfoAggregator } from '../../rd/RDInfoAggregator'
import { RFPValidator } from '../../validation'

@injectable()
export class GetRFPSummaryUseCase {
  private readonly logger = getLogger('GetRFPSummaryUseCase')

  constructor(
    @inject(TYPES.RFPValidator) private readonly rfpValidator: RFPValidator,
    @inject(TYPES.ReplyDataAgent) private readonly replyDataAgent: ReplyDataAgent,
    @inject(TYPES.RDInfoAggregator) private readonly rDInfoAggregator: RDInfoAggregator
  ) {}

  public async execute(rdId: string): Promise<IParticipantRFPSummary[]> {
    this.logger.info(`Getting RFP summaries for rdId: ${rdId}`)

    const rfp = await this.rfpValidator.validateRFPExistsByRdId(rdId)
    this.logger.info(`Retrieved RFP with id: ${rfp.rfpId}`)

    const replies = await this.replyDataAgent.findAllByRdId(rdId)
    return this.rDInfoAggregator.createParticipantRFPSummaries(rfp.participantStaticIds, replies)
  }
}
