import { ErrorCode } from '@komgo/error-utilities'
import { getLogger } from '@komgo/logging'
import { IReceivablesDiscounting, IReceivablesDiscountingBase } from '@komgo/types'
import { injectable, inject } from 'inversify'

import { ReceivablesDiscountingDataAgent, RFPDataAgent } from '../../../data-layer/data-agents'
import { ErrorName } from '../../../ErrorName'
import { TYPES } from '../../../inversify'
import { removeTimeFromDates } from '../../../utils'
import { ValidationFieldError, EntityNotFoundError } from '../../errors'
import { ReceivablesDiscountingValidator } from '../../validation'

@injectable()
export class ReplaceRDUseCase {
  private readonly logger = getLogger('ReplaceRDUseCase')

  constructor(
    @inject(TYPES.ReceivablesDiscountingDataAgent) private readonly rdDataAgent: ReceivablesDiscountingDataAgent,
    @inject(TYPES.RFPDataAgent) private readonly rfpDataAgent: RFPDataAgent,
    @inject(TYPES.ReceivablesDiscountingValidator) private readonly rdValidator: ReceivablesDiscountingValidator
  ) {}

  public async execute(rdId: string, replacement: IReceivablesDiscountingBase): Promise<IReceivablesDiscounting> {
    this.logger.info('Will replace RD', { rdId })
    // convert the dates to YYYY-MM-DD which the validator requires
    this.rdValidator.validateFields(removeTimeFromDates(replacement))
    await this.validateRFPDoesNotExist(rdId)

    this.logger.info('Replacing validated RD', { rdId })
    const updated = await this.rdDataAgent.replace(rdId, replacement)
    if (!updated) {
      const msg = `RD with ID "${rdId}" was not found`
      this.logger.error(ErrorCode.DatabaseMissingData, ErrorName.RDNotFoundForReplace, msg, { rdId })
      throw new EntityNotFoundError(msg)
    }
    return updated
  }

  private async validateRFPDoesNotExist(rdId: string) {
    const rfp = await this.rfpDataAgent.findByRdId(rdId)
    if (rfp) {
      const msg = 'An RFP already exists for this RD'
      this.logger.error(ErrorCode.ValidationInvalidOperation, ErrorName.RFPAlreadyExists, msg, {
        rdId,
        rfpId: rfp.rfpId
      })
      throw new ValidationFieldError(msg, {
        rdId: ['This application for discounting has already been pushed to market']
      })
    }
  }
}
