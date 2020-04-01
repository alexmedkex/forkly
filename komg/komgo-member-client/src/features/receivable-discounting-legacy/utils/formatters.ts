import { displayDate, dateFormats } from '../../../utils/date'
import { IReceivablesDiscounting, IDiff, IReceivablesDiscountingBase, ITradeReference, Currency } from '@komgo/types'
import { ReplaceOperation } from 'fast-json-patch/lib/core'
import { get } from 'lodash'
import { omitDeep } from '../../letter-of-credit-legacy/utils/DiffUtils'
import { compare } from 'fast-json-patch'
import Numeral from 'numeral'

// Format the data for use in the edit - Apply for discounting
export const formatRdForInputs = (rd: IReceivablesDiscounting) => {
  const formattedRd = { ...rd }
  if (formattedRd.discountingDate) {
    formattedRd.discountingDate = formatInputDate(rd.discountingDate)
  }
  if (formattedRd.riskCoverDate) {
    formattedRd.riskCoverDate = formatInputDate(rd.riskCoverDate)
  }
  if (formattedRd.dateOfPerformance) {
    formattedRd.dateOfPerformance = formatInputDate(rd.dateOfPerformance)
  }
  return formattedRd
}

// TODO : Look in to a nicer way of getting form specific object, validation fails if any additional values.
export const cleanReceivableDiscountingInfo = (rd: IReceivablesDiscounting, tradeReference: ITradeReference) => {
  const applyForDiscountingFormFields = formatRdForInputs(rd)
  delete applyForDiscountingFormFields.version
  delete applyForDiscountingFormFields.staticId
  delete applyForDiscountingFormFields.tradeReference
  const { _id, ...referenceWithoutId } = tradeReference as ITradeReference & { _id: string }
  applyForDiscountingFormFields.tradeReference = referenceWithoutId
  return applyForDiscountingFormFields
}

export const formatInputDate = (dateField: string) => displayDate(dateField, dateFormats.inputs)
export const formatMonetaryAmount = (amount: number, currency: Currency) =>
  `${currency} ${Numeral(amount).format('0,0.00')}`

const RD_DATABASE_FIELDS = ['createdAt', 'updatedAt', 'staticId', '__v', '_id', 'version']

const toDiff = (op: ReplaceOperation<any>, previous, type: 'IReceivablesDiscountingBase'): IDiff => {
  const path = op.path.split('/').slice(1)
  return {
    op: op.op,
    path: op.path,
    value: op.value,
    oldValue: get(previous, path),
    type
  }
}

export const receivablesDiscountingBaseDiff = (
  previous: IReceivablesDiscountingBase,
  latest: IReceivablesDiscountingBase
): IDiff[] =>
  compare(omitDeep(previous, RD_DATABASE_FIELDS), omitDeep(latest, RD_DATABASE_FIELDS)).map(
    (op: ReplaceOperation<any>) => toDiff(op, previous, 'IReceivablesDiscountingBase')
  )
