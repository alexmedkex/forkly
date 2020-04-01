import { ErrorCode } from '@komgo/error-utilities'
import { getLogger } from '@komgo/logging'
import { tradeFinanceManager } from '@komgo/permissions'
import { ITradeSnapshot } from '@komgo/types'
import { inject, injectable } from 'inversify'

import { NotificationClient } from '../../../business-layer/microservice-clients'
import { TradeSnapshotValidator } from '../../../business-layer/validation'
import { ReceivablesDiscountingDataAgent, TradeSnapshotDataAgent } from '../../../data-layer/data-agents'
import { ErrorName } from '../../../ErrorName'
import { TYPES } from '../../../inversify'
import { InvalidPayloadProcessingError } from '../../errors'
import { IReceivableFinanceMessage, IReceiveUpdateUseCase, UpdateType, ITradeSnapshotUpdatePayload } from '../../types'

@injectable()
export class ReceiveTradeSnapshotUpdateUseCase implements IReceiveUpdateUseCase<ITradeSnapshot> {
  private logger = getLogger('ReceiveTradeSnapshotUpdateUseCase')

  constructor(
    @inject(TYPES.TradeSnapshotDataAgent) private readonly tradeSnapshotDataAgent: TradeSnapshotDataAgent,
    @inject(TYPES.ReceivablesDiscountingDataAgent) private readonly rdDataAgent: ReceivablesDiscountingDataAgent,
    @inject(TYPES.NotificationClient) private readonly notificationClient: NotificationClient,
    @inject(TYPES.TradeSnapshotValidator) private readonly tradeSnapshotValidator: TradeSnapshotValidator
  ) {}

  public async execute(message: IReceivableFinanceMessage<ITradeSnapshotUpdatePayload>): Promise<void> {
    const updatedTradeSnapshot = message.data.entry
    this.logger.info('Received Trade snapshot update message', {
      source: updatedTradeSnapshot.source,
      sourceId: updatedTradeSnapshot.sourceId
    })

    const currentTradeSnapshot = await this.tradeSnapshotDataAgent.findByTradeSourceId(updatedTradeSnapshot.sourceId)
    if (!currentTradeSnapshot) {
      const msg = 'Trade Snapshot not found'
      this.logger.error(ErrorCode.ValidationInternalAMQP, ErrorName.UpdateTradeSnapshotNotFound, msg, {
        sourceId: updatedTradeSnapshot.sourceId
      })
      throw new InvalidPayloadProcessingError(msg)
    }
    if (new Date(currentTradeSnapshot.createdAt).getTime() >= new Date(updatedTradeSnapshot.createdAt).getTime()) {
      this.logger.info('Received is older or the same as current quote. Skipping update')
      return
    }

    const acceptedReply = await this.tradeSnapshotValidator.validateAcceptedRD(updatedTradeSnapshot.sourceId)

    await this.tradeSnapshotDataAgent.updateCreate(updatedTradeSnapshot)
    await this.sendNotification(message, acceptedReply.rdId, updatedTradeSnapshot.createdAt)

    this.logger.info('Trade snapshot successfully updated', {
      sourceId: updatedTradeSnapshot.sourceId
    })
  }

  private async sendNotification(
    message: IReceivableFinanceMessage<ITradeSnapshotUpdatePayload>,
    rdId: string,
    createdAt: string
  ) {
    const rd = await this.rdDataAgent.findByStaticId(rdId)
    const notification = await this.notificationClient.createUpdateNotification(
      rd,
      message.data.senderStaticId,
      UpdateType.TradeSnapshot,
      tradeFinanceManager.canReadRDRequests.action,
      message.context,
      createdAt
    )
    await this.notificationClient.sendNotification(notification)
  }
}
