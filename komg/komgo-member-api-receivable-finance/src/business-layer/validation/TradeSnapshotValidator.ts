import { ErrorCode } from '@komgo/error-utilities'
import { getLogger } from '@komgo/logging'
import { IReceivablesDiscounting, ReplyType } from '@komgo/types'
import { injectable, inject } from 'inversify'

import { ReceivablesDiscountingDataAgent, ReplyDataAgent } from '../../data-layer/data-agents'
import { IReply } from '../../data-layer/models/replies/IReply'
import { ErrorName } from '../../ErrorName'
import { TYPES } from '../../inversify/types'
import { EntityNotFoundError } from '../errors'

@injectable()
export class TradeSnapshotValidator {
  private logger = getLogger('TradeSnapshotValidator')

  constructor(
    @inject(TYPES.ReplyDataAgent) private readonly replyDataAgent: ReplyDataAgent,
    @inject(TYPES.ReceivablesDiscountingDataAgent)
    private readonly receivablesDiscountingDataAgent: ReceivablesDiscountingDataAgent
  ) {}

  public async validateRDExists(tradeSourceId: string): Promise<IReceivablesDiscounting> {
    const rd: IReceivablesDiscounting = await this.receivablesDiscountingDataAgent.findByTradeSourceId(tradeSourceId)
    if (!rd) {
      const message = `There is no RD for the trade received`
      this.logger.error(ErrorCode.DatabaseMissingData, ErrorName.FailedTradeSnapshotValidationMissingRD, message, {
        tradeSourceId
      })
      throw new EntityNotFoundError(message)
    }
    return rd
  }

  /**
   * Validate if Trade has a RD associated in Accepted status
   */
  public async validateAcceptedRD(tradeSourceId: string): Promise<IReply> {
    const rd = await this.validateRDExists(tradeSourceId)
    const acceptedReply: IReply = await this.replyDataAgent.findByRdIdAndType(rd.staticId, ReplyType.Accepted)
    if (!acceptedReply) {
      const message = `Trade Snapshot can't be updated as RD is not accepted`
      this.logger.error(ErrorCode.DatabaseMissingData, ErrorName.FailedTradeSnapshotValidationRDNotAccepted, message, {
        tradeSourceId,
        rdId: rd.staticId
      })
      throw new EntityNotFoundError(message)
    }

    return acceptedReply
  }
}
