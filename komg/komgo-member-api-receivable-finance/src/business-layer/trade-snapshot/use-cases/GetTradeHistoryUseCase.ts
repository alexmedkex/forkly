import { ErrorCode } from '@komgo/error-utilities'
import { getLogger } from '@komgo/logging'
import { IHistory, ITradeSnapshot } from '@komgo/types'
import { inject, injectable } from 'inversify'

import { TradeSnapshotDataAgent } from '../../../data-layer/data-agents'
import { ErrorName } from '../../../ErrorName'
import { TYPES } from '../../../inversify'
import { createHistory } from '../../../utils'
import { EntityNotFoundError } from '../../errors'

@injectable()
export class GetTradeHistoryUseCase {
  private readonly logger = getLogger('GetTradeHistoryUseCase')

  constructor(@inject(TYPES.TradeSnapshotDataAgent) private readonly tradeSnapshotDataAgent: TradeSnapshotDataAgent) {}

  public async execute(sourceId: string): Promise<IHistory<ITradeSnapshot>> {
    this.logger.info('Get history for trade', { sourceId })

    const tradeSnapshots = await this.tradeSnapshotDataAgent.findAllBySourceId(sourceId)
    this.logger.info(`found ${tradeSnapshots.length} trade snapshots`, { sourceId })
    if (tradeSnapshots.length === 0) {
      this.logger.warn(ErrorCode.DatabaseMissingData, ErrorName.TradeSnapshotNotFoundForHistory, {
        sourceId
      })
      throw new EntityNotFoundError(`Trade snapshot not found with Source ID - ${sourceId}`)
    }

    const history = createHistory(tradeSnapshots)
    return history ? history : {}
  }
}
