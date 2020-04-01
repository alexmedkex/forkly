import { ErrorCode } from '@komgo/error-utilities'
import { getLogger } from '@komgo/logging'
import { toValidationErrors } from '@komgo/microservice-config'
import { RD_ADD_DISCOUNTING_SCHEMA, IReceivablesDiscounting } from '@komgo/types'
import * as Ajv from 'ajv'
import { injectable } from 'inversify'

import { ErrorName } from '../../ErrorName'
import { ValidationFieldError } from '../errors'

@injectable()
export class AddDiscountingValidator {
  private readonly logger = getLogger('AddDiscountingValidator')
  private readonly validator: Ajv.Ajv = new Ajv({ allErrors: true, $data: true })

  /**
   * Validates IReceivablesDiscounting according to the add discounting schema
   *
   * @param rd
   * @throws ValidationFieldError if schema validation fails
   */
  public validate(rd: IReceivablesDiscounting) {
    const valid = this.validator.validate(RD_ADD_DISCOUNTING_SCHEMA, rd)

    if (!valid) {
      const validationErrors = toValidationErrors(this.validator.errors)
      this.logger.error(
        ErrorCode.ValidationHttpSchema,
        ErrorName.AddDiscountingFieldValidation,
        'IReceivablesDiscountingBase validation errored for adding discounting',
        validationErrors
      )
      throw new ValidationFieldError('Receivables discounting validation failed', validationErrors)
    }
  }
}
