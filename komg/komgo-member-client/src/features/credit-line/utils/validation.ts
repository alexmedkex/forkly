import { FormikProps } from 'formik'
import { ICreateOrEditCreditLineForm } from '../store/types'
import { findFormikErrors } from '../../trades/utils/findTouchedErrors'
import { sentenceCase } from '../../../utils/casings'

export const getErrorForSpecificField = (fieldName: string, formik: FormikProps<any>) => {
  const errors = findFormikErrors(formik.errors, formik.touched)
  if (errors[fieldName]) {
    return sentenceCase((errors[fieldName] as string).replace(`'${fieldName}'`, '').trim())
  }
  return ''
}

export const isDisabledCounterpartyStaticId = (index: number, values: ICreateOrEditCreditLineForm): boolean =>
  values.counterpartyStaticId === ''

export const isDisabledDefault = (index: number, values: ICreateOrEditCreditLineForm): boolean =>
  !values.appetite || !values.sharedCreditLines[index].data.appetite.shared

export const isDisabledMinRiskFeeAmount = (index: number, values: ICreateOrEditCreditLineForm): boolean =>
  !values.appetite ||
  !values.sharedCreditLines[index].data.appetite.shared ||
  !values.sharedCreditLines[index].data.fee.shared

export const isDisabledMarginAmount = (index: number, values: ICreateOrEditCreditLineForm): boolean =>
  !values.appetite ||
  !values.sharedCreditLines[index].data.appetite.shared ||
  !values.sharedCreditLines[index].data.margin.shared

export const isDisabledAvailabilityAmount = (index: number, values: ICreateOrEditCreditLineForm): boolean =>
  !values.appetite || !values.availability || !values.sharedCreditLines[index].data.appetite.shared

export const isDisabledMaxTenorAmount = (index: number, values: ICreateOrEditCreditLineForm): boolean =>
  !values.appetite ||
  !values.sharedCreditLines[index].data.appetite.shared ||
  !values.sharedCreditLines[index].data.maximumTenor.shared
