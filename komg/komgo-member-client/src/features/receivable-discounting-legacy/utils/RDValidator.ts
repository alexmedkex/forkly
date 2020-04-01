import { IReceivablesDiscountingBase, IReceivablesDiscounting } from '@komgo/types'
import Ajv from 'ajv'
import { toFormikErrors } from '../../../utils/validator'
import { ISubmitQuoteFormDetails } from '../store/types'
import { rdQuoteSchema, rdDiscountingSchema } from './constants'

export const ALL_VALIDATION_FIELDS = 'All'

export class RDValidator {
  private readonly validator: Ajv.Ajv

  constructor(customValidator?: Ajv.Ajv) {
    if (customValidator) {
      this.validator = customValidator
    } else {
      this.validator = new Ajv({ allErrors: true, $data: true })
    }
  }

  validateReceivableDiscounting(values: Partial<IReceivablesDiscountingBase>) {
    return this.validateAndFormatBySchema(rdDiscountingSchema, values)
  }

  validateQuoteSubmission(values: ISubmitQuoteFormDetails, rd: IReceivablesDiscounting) {
    return this.validateAndFormatBySchema(rdQuoteSchema, {
      ...values,
      requestType: rd.requestType,
      discountingType: rd.discountingType,
      daysOfDiscountingProvided: this.hasTraderProvidedDaysOfDiscounting(rd.numberOfDaysDiscounting)
    })
  }

  validateAndFormatBySchema(schema: any, values: any) {
    let errors = {}
    if (!this.validator.validate(schema, values)) {
      const formikErrors = toFormikErrors(this.validator.errors)
      errors = { ...formikErrors }
    }
    return errors
  }

  private hasTraderProvidedDaysOfDiscounting(rdDaysOfDiscounting: number) {
    return rdDaysOfDiscounting !== undefined && rdDaysOfDiscounting !== null
  }
}

export const rdValidator = new RDValidator()
