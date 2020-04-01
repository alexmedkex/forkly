import { ErrorCode } from '@komgo/error-utilities'
import { getLogger } from '@komgo/logging'
import { ITradeMessage } from '@komgo/messaging-types'
import { CreditRequirements, ITrade, ITradeSnapshot } from '@komgo/types'
import { inject, injectable } from 'inversify'

import { TradeSnapshotDataAgent } from '../../../data-layer/data-agents'
import { ErrorName } from '../../../ErrorName'
import { TYPES } from '../../../inversify'
import { InvalidPayloadProcessingError } from '../../errors'
import { ShareTradeSnapshotUseCase } from '../../trade-snapshot/use-cases'
import { TradeSnapshotValidator } from '../../validation'
import { createCleanSnapshot } from '../utils'

@injectable()
export class ReceiveTradeUseCase {
  private logger = getLogger('ReceiveTradeUseCase')

  constructor(
    @inject(TYPES.TradeSnapshotDataAgent) private readonly tradeDataAgent: TradeSnapshotDataAgent,
    @inject(TYPES.TradeSnapshotValidator) private readonly tradeSnapshotValidator: TradeSnapshotValidator,
    @inject(TYPES.ShareTradeSnapshotUseCase) private readonly shareTradeSnapshotUseCase: ShareTradeSnapshotUseCase
  ) {}

  public async execute(message: ITradeMessage): Promise<void> {
    const updatedTrade: ITrade = message.trade as ITrade
    this.logger.info('Received Internal Trade Updated message from api-trade-cargo', {
      sourceId: updatedTrade.sourceId,
      source: updatedTrade.source
    })

    if (updatedTrade.creditRequirement !== CreditRequirements.OpenCredit) {
      this.logger.info('Ignore internal Trade message as is not a seller trade', {
        sourceId: updatedTrade.sourceId,
        source: updatedTrade.source
      })
      return
    }

    const currentTradeSnapshot = await this.tradeDataAgent.findByTradeSourceId(updatedTrade.sourceId)
    if (!currentTradeSnapshot) {
      this.logger.info('Ignore internal Trade message as there is no previous Trade Snapshot to update', {
        sourceId: updatedTrade.sourceId,
        source: updatedTrade.source
      })
      return
    }
    // check the createdAt date of snapshot against updatedAt of ITrade
    if (this.isUpdateBeforeSavedData(updatedTrade, currentTradeSnapshot)) {
      this.logger.info('Ignore internal Trade message as the received one is older than saved one', {
        latestSavedUpdate: currentTradeSnapshot.trade.updatedAt,
        latestSavedSnapshot: currentTradeSnapshot.createdAt,
        incomingUpdate: updatedTrade.updatedAt
      })
      return
    }

    await this.tradeSnapshotValidator.validateAcceptedRD(updatedTrade.sourceId)

    if (!this.isAlreadyUpdated(updatedTrade, currentTradeSnapshot)) {
      const updatedTradeSnapshot: ITradeSnapshot = createCleanSnapshot(currentTradeSnapshot, {
        trade: updatedTrade
      })

      await this.tradeDataAgent.update(updatedTradeSnapshot)
    }

    await this.shareTradeSnapshotUseCase.execute(updatedTrade.sourceId)
    this.logger.info('Trade Snapshot updated and shared with bank')
  }

  private isUpdateBeforeSavedData(updatedTrade: ITrade, currentTradeSnapshot: ITradeSnapshot) {
    return new Date(updatedTrade.updatedAt).getTime() < new Date(currentTradeSnapshot.trade.updatedAt).getTime()
  }

  private isAlreadyUpdated(updatedTrade: ITrade, currentTradeSnapshot: ITradeSnapshot) {
    return new Date(updatedTrade.updatedAt).getTime() === new Date(currentTradeSnapshot.trade.updatedAt).getTime()
  }
}
