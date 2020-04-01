import moment from 'moment'
import {
  IReceivablesDiscounting,
  IReceivablesDiscountingBase,
  IFinancialInstrumentInfo,
  IQuote,
  IQuoteBase,
  RequestType,
  DiscountingType
} from '@komgo/types'
import { RD_DEFAULT_VERSION, initialFinancialInstrumentInfo } from './constants'
import { ALL_VALIDATION_FIELDS, rdValidator } from './RDValidator'
import { FormikErrors } from 'formik'
import _ from 'lodash'
import { sanitizeQuoteForValidation, sanitizeReceivableDiscontingForValidation } from './sanitize'

const INPUT_DATE_FORMAT = 'YYYY-MM-DD'
const RD_READONLY_FIELDS: Array<keyof IReceivablesDiscountingBase> = [
  'advancedRate',
  'currency',
  'numberOfDaysDiscounting',
  'tradeReference'
]

export const decorateRDForInitialValues = ({
  createdAt,
  updatedAt,
  staticId,
  ...rd
}: IReceivablesDiscounting): IReceivablesDiscountingBase => {
  delete (rd as any)._id
  return {
    ...rd,
    version: rd.version || RD_DEFAULT_VERSION,
    financialInstrumentInfo: rd.financialInstrumentInfo
      ? rd.financialInstrumentInfo
      : (initialFinancialInstrumentInfo as IFinancialInstrumentInfo),
    dateOfPerformance: rd.dateOfPerformance ? moment(rd.dateOfPerformance).format(INPUT_DATE_FORMAT) : undefined,
    discountingDate: rd.discountingDate ? moment(rd.discountingDate).format(INPUT_DATE_FORMAT) : undefined,
    riskCoverDate: rd.riskCoverDate ? moment(rd.riskCoverDate).format(INPUT_DATE_FORMAT) : undefined,
    tradeReference: {
      sourceId: rd.tradeReference.sourceId,
      source: rd.tradeReference.source,
      sellerEtrmId: rd.tradeReference.sellerEtrmId
    }
  }
}

const normalize = (value: any) => (value == null || value === '' ? undefined : value)

export const createReceivableDiscountingEditValidator = (
  initialValues: IReceivablesDiscountingBase,
  readonlyFields = RD_READONLY_FIELDS
) => (editedValues: IReceivablesDiscountingBase): FormikErrors<IReceivablesDiscountingBase> => {
  const message = field => `"${field}" cannot be edited`

  const readonlyErrors = readonlyFields
    .filter(field => !_.isEqual(normalize(initialValues[field]), normalize(editedValues[field])))
    .reduce((fields, field) => ({ ...fields, [field]: message(field) }), {})

  const validationErrors = rdValidator.validateReceivableDiscounting(
    sanitizeReceivableDiscontingForValidation(editedValues)
  )
  const errors = {
    ...validationErrors,
    ...readonlyErrors
  }

  if (_.isEqual(normalize(initialValues), normalize(editedValues))) {
    errors[ALL_VALIDATION_FIELDS] = 'You have not made any changes'
  }
  return errors
}

export const decorateQuoteForInitialValues = ({ createdAt, updatedAt, staticId, ...quote }: IQuote): IQuoteBase => {
  delete (quote as any)._id
  return {
    ...quote,
    comment: undefined
  }
}

export const createEditQuoteValidator = (initialValues: any, rd: IReceivablesDiscounting) => (
  editedValues: IQuoteBase
): FormikErrors<IQuoteBase> => {
  const errors = rdValidator.validateQuoteSubmission(sanitizeQuoteForValidation(editedValues), rd)
  if (_.isEqual(normalize(initialValues), normalize(editedValues))) {
    errors[ALL_VALIDATION_FIELDS] = 'You have not made any changes'
  }
  return errors
}
