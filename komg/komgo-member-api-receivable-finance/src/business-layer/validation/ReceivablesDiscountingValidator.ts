import { ErrorCode } from '@komgo/error-utilities'
import { getLogger } from '@komgo/logging'
import { toValidationErrors } from '@komgo/microservice-config'
import { IReceivablesDiscountingBase, RECEIVABLES_DISCOUNTING_SCHEMA } from '@komgo/types'
import * as Ajv from 'ajv'
import { injectable, inject } from 'inversify'

import { ReceivablesDiscountingDataAgent } from '../../data-layer/data-agents'
import { ErrorName } from '../../ErrorName'
import { TYPES } from '../../inversify/types'
import { ValidationDuplicateError, ValidationFieldError } from '../errors'

@injectable()
export class ReceivablesDiscountingValidator {
  private readonly logger = getLogger('ReceivablesDiscountingValidator')
  private readonly validator: Ajv.Ajv = new Ajv({ allErrors: true, $data: true })

  constructor(
    @inject(TYPES.ReceivablesDiscountingDataAgent) private readonly rdDataAgent: ReceivablesDiscountingDataAgent
  ) {}

  /**
   * Validates IReceivablesDiscountingBase
   *
   * @param rdBase
   * @throws ValidationFieldError if schema validation fails
   * @throws ValidationDuplicateError if rd data with the given trade reference exists
   */
  public async validate(rdBase: IReceivablesDiscountingBase): Promise<void> {
    this.validateFields(rdBase)
    await this.validateDataUnique(rdBase)
  }

  public validateFields(rdBase: IReceivablesDiscountingBase) {
    const valid = this.validator.validate(RECEIVABLES_DISCOUNTING_SCHEMA, rdBase)
    if (!valid) {
      const validationErrors = toValidationErrors(this.validator.errors)
      this.logger.error(
        ErrorCode.ValidationHttpSchema,
        ErrorName.RdValidationFieldError,
        'IReceivablesDiscountingBase validation errored',
        validationErrors
      )
      throw new ValidationFieldError('Receivables discounting validation failed', validationErrors)
    }
  }

  private async validateDataUnique(rdBase: IReceivablesDiscountingBase) {
    const tradeRef = rdBase.tradeReference
    const existingRd = await this.rdDataAgent.findByTrade(
      rdBase.tradeReference.sourceId,
      rdBase.tradeReference.sellerEtrmId
    )

    if (existingRd) {
      this.logger.error(
        ErrorCode.DatabaseInvalidData,
        ErrorName.RdValidationDuplicateError,
        'Unable to save - receivables discounting data found with given trade details',
        { tradeRef }
      )
      throw new ValidationDuplicateError(
        `Receivable discounting request for a trade with the specified seller EtrmId and/or SourceId already exists. Seller EtrmId: ${tradeRef.sellerEtrmId}, Source Id: ${tradeRef.sourceId}`
      )
    }
  }
}
