import { getLogger } from '@komgo/logging'
import { IReceivablesDiscountingInfo } from '@komgo/types'
import { injectable, inject } from 'inversify'

import { ReceivablesDiscountingDataAgent } from '../../../data-layer/data-agents'
import { TYPES } from '../../../inversify'
import { RDInfoAggregator } from '../RDInfoAggregator'

@injectable()
export class GetRDInfoUseCase {
  private readonly logger = getLogger('GetRDInfoUseCase')

  constructor(
    @inject(TYPES.ReceivablesDiscountingDataAgent) private readonly rdDataAgent: ReceivablesDiscountingDataAgent,
    @inject(TYPES.RDInfoAggregator) private readonly rDInfoAggregator: RDInfoAggregator
  ) {}

  public async execute(rdId: string): Promise<IReceivablesDiscountingInfo> {
    this.logger.info(`Getting RD application for id: ${rdId}`)

    const rd = await this.rdDataAgent.findByStaticId(rdId)
    return this.rDInfoAggregator.aggregate(rd)
  }
}
