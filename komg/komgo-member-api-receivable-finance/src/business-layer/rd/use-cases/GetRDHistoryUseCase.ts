import { ErrorCode } from '@komgo/error-utilities'
import { getLogger } from '@komgo/logging'
import { IReceivablesDiscounting, IHistory } from '@komgo/types'
import { inject, injectable } from 'inversify'

import { ReceivablesDiscountingDataAgent } from '../../../data-layer/data-agents'
import { ErrorName } from '../../../ErrorName'
import { TYPES } from '../../../inversify'
import { createHistory } from '../../../utils'
import { EntityNotFoundError } from '../../errors'

const TRADE_REFERENCE_FIELD_NAME = 'tradeReference'

@injectable()
export class GetRDHistoryUseCase {
  private readonly logger = getLogger('GetRDHistoryUseCase')
  constructor(
    @inject(TYPES.ReceivablesDiscountingDataAgent) private readonly rdDataAgent: ReceivablesDiscountingDataAgent
  ) {}

  public async execute(rdId: string): Promise<IHistory<IReceivablesDiscounting>> {
    this.logger.info('Get history for RD', { rdId })

    const rds = await this.rdDataAgent.findAllByStaticId(rdId)
    this.logger.info(`found ${rds.length} RDs for RD ID`, { rdId })
    if (rds.length === 0) {
      this.logger.warn(ErrorCode.DatabaseMissingData, ErrorName.RDNotFoundForHistory, {
        rdId
      })
      throw new EntityNotFoundError(`Receivable Discounting data not found with ID - ${rdId}`)
    }

    const history = createHistory(rds, [TRADE_REFERENCE_FIELD_NAME])
    return history ? history : {}
  }
}
