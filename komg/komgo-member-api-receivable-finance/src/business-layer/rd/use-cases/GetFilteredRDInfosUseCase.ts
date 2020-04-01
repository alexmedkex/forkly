import { getLogger } from '@komgo/logging'
import { IReceivablesDiscountingInfo } from '@komgo/types'
import { injectable, inject } from 'inversify'

import { ReceivablesDiscountingDataAgent } from '../../../data-layer/data-agents'
import { TYPES } from '../../../inversify'
import { IRDFilter } from '../../types'
import { RDInfoAggregator } from '../RDInfoAggregator'

@injectable()
export class GetFilteredRDInfosUseCase {
  private readonly logger = getLogger('GetFilteredRDInfosUseCase')

  constructor(
    @inject(TYPES.ReceivablesDiscountingDataAgent) private readonly rdDataAgent: ReceivablesDiscountingDataAgent,
    @inject(TYPES.RDInfoAggregator) private readonly rDInfoAggregator: RDInfoAggregator
  ) {}

  public async execute(filter: IRDFilter): Promise<IReceivablesDiscountingInfo[]> {
    const rds = await this.getRds(filter)

    const rdInfos: IReceivablesDiscountingInfo[] = []
    for (const rd of rds) {
      const rfpReply = await this.rDInfoAggregator.aggregate(rd)
      rdInfos.push(rfpReply)
    }

    this.logger.info(`Returning ${rdInfos.length} IReceivableDiscountingInfos`)
    return rdInfos
  }

  private getRds(filter: IRDFilter) {
    if (filter.tradeSourceIds) {
      this.logger.info('Get IReceivableDiscountingInfos with', filter.tradeSourceIds)
      return this.rdDataAgent.findByTradeSourceIds(filter.tradeSourceIds)
    } else {
      this.logger.info('No filter provided so get all IReceivableDiscountingInfos')
      return this.rdDataAgent.findAll()
    }
  }
}
