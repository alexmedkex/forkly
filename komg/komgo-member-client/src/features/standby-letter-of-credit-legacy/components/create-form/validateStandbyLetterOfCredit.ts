import { IStandbyLetterOfCreditBase, SBLC_BASE_SCHEMA } from '@komgo/types'
import Ajv from 'ajv'
import { toFormikErrors } from '../../../../utils/validator'
import { isInPast } from '../../../../utils/date'

const VALIDATOR = new Ajv({ allErrors: true }).addSchema(SBLC_BASE_SCHEMA)

export const isStandbyLetterOfCreditValid = (values: IStandbyLetterOfCreditBase) =>
  VALIDATOR.validate((SBLC_BASE_SCHEMA as any).$id, values) && !isInPast(values.expiryDate)

export const validateStandbyLetterOfCredit = (values: IStandbyLetterOfCreditBase) => {
  let errors = {}
  if (!VALIDATOR.validate('http://komgo.io/schema/sblc/1/base', values)) {
    errors = toFormikErrors(VALIDATOR.errors)
  }
  return errors
}
