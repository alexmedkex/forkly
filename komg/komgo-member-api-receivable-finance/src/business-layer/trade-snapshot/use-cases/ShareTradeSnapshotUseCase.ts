import { ErrorCode } from '@komgo/error-utilities'
import { getLogger } from '@komgo/logging'
import { ITradeSnapshot } from '@komgo/types'
import { injectable, inject } from 'inversify'

import { TradeSnapshotDataAgent } from '../../../data-layer/data-agents'
import { IReply } from '../../../data-layer/models/replies/IReply'
import { ErrorName } from '../../../ErrorName'
import { TYPES } from '../../../inversify'
import { EntityNotFoundError } from '../../errors'
import { OutboundMessageFactory, OutboundPublisher } from '../../messaging'
import { UpdateType } from '../../types'
import { TradeSnapshotValidator } from '../../validation'

@injectable()
export class ShareTradeSnapshotUseCase {
  private readonly logger = getLogger('ShareTradeSnapshotUseCase')

  constructor(
    @inject(TYPES.TradeSnapshotDataAgent) private readonly tradeDataAgent: TradeSnapshotDataAgent,
    @inject(TYPES.OutboundMessageFactory) private readonly outboundMessageFactory: OutboundMessageFactory,
    @inject(TYPES.OutboundPublisher) private readonly outboundPublisher: OutboundPublisher,
    @inject(TYPES.TradeSnapshotValidator) private readonly tradeSnapshotValidator: TradeSnapshotValidator
  ) {}

  public async execute(sourceId: string): Promise<void> {
    this.logger.info('Sharing Trade snapshot', { sourceId })

    const tradeSnapshot: ITradeSnapshot = await this.tradeDataAgent.findByTradeSourceId(sourceId)
    if (!tradeSnapshot) {
      this.logger.warn(ErrorCode.DatabaseMissingData, ErrorName.TradeSnapshotNotFoundForShare, { sourceId })
      throw new EntityNotFoundError(`Trade Snapshot not found with sourceId=${sourceId}`)
    }

    const acceptedReply = await this.tradeSnapshotValidator.validateAcceptedRD(sourceId)

    const outboundMessage = this.outboundMessageFactory.createRDUpdateMessage(
      acceptedReply.rdId,
      tradeSnapshot,
      UpdateType.TradeSnapshot
    )
    // Here the trade shares with the bank, so the recipient static id is the participant of the reply
    await this.outboundPublisher.send(acceptedReply.participantId, outboundMessage)

    this.logger.info('Trade Snapshot shared successfully', { sourceId })
  }
}
