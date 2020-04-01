import { injectable, inject } from 'inversify'
import { getLogger } from '@komgo/logging'

import { ITradeInstrumentValidationService } from './ITradeInstrumentValidationService'
import { ISBLCDataAgent, ILCCacheDataAgent } from '../../data-layer/data-agents'
import { TYPES } from '../../inversify/types'
import { ITradeCargoClient } from './ITradeCargoClient'
import { LC_STATE } from '../events/LC/LCStates'
import { StandbyLetterOfCreditStatus, IStandbyLetterOfCredit } from '@komgo/types'
import { ErrorCode } from '@komgo/error-utilities'
import { ErrorNames } from '../../exceptions/utils'

@injectable()
export class TradeInstrumentValidationService implements ITradeInstrumentValidationService {
  private readonly logger = getLogger('TradeInstrumentValidationService')

  constructor(
    @inject(TYPES.SBLCDataAgent) private readonly sblcDataAgent: ISBLCDataAgent,
    @inject(TYPES.LCCacheDataAgent) private readonly lcCacheDataAgent: ILCCacheDataAgent,
    @inject(TYPES.TradeCargoClient) private readonly tradeCargoClient: ITradeCargoClient
  ) {}

  async validateById(tradeId: string): Promise<boolean> {
    const trade = await this.tradeCargoClient.getTrade(tradeId)
    if (!trade) {
      this.logger.warn(
        ErrorCode.DatabaseMissingData,
        ErrorNames.TradeInstrumentValidationServiceTradeNotFound,
        `validation failed, trade not exists`,
        {
          tradeId
        },
        new Error().stack
      )
      return false
    }
    return this.validateBySourceId(trade.source, trade.sourceId)
  }

  async validateBySourceId(source: string, sourceId: string): Promise<boolean> {
    const sblc = await this.getActiveSBLC(source, sourceId)
    if (sblc && sblc.length > 0) {
      this.logger.warn(
        ErrorCode.ValidationInvalidOperation,
        ErrorNames.TradeInstrumentValidationServiceValidateBySourceIdFailedSBLCExists,
        `validation failed, active sblc exists`,
        {
          source,
          sourceId
        },
        new Error().stack
      )
      return false
    }

    const lc = await this.getActiveLC(source, sourceId)
    if (lc) {
      this.logger.warn(
        ErrorCode.ValidationInvalidOperation,
        ErrorNames.TradeInstrumentValidationServiceValidateBySourceIdFailedLCExists,
        `validation failed, active lc exists`,
        {
          source,
          sourceId
        },
        new Error().stack
      )
      return false
    }

    return true
  }

  async getActiveSBLC(source: string, sourceId: string): Promise<IStandbyLetterOfCredit[]> {
    return this.sblcDataAgent.find({
      'tradeId.sourceId': sourceId,
      'tradeId.source': source,
      status: {
        $nin: [
          StandbyLetterOfCreditStatus.Failed,
          StandbyLetterOfCreditStatus.RequestRejected,
          StandbyLetterOfCreditStatus.IssuedRejected
        ]
      }
    })
  }

  async getActiveLC(source: string, sourceId: string) {
    const lc = await this.lcCacheDataAgent.getLC({
      'tradeAndCargoSnapshot.sourceId': sourceId,
      'tradeAndCargoSnapshot.source': source,
      status: { $nin: [LC_STATE.ISSUED_LC_REJECTED, LC_STATE.REQUEST_REJECTED, LC_STATE.FAILED] }
    })

    return lc
  }
}
