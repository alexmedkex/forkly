import { findTouchedErrors } from '../../trades/utils/findTouchedErrors'
import { IReceivablesDiscountingBase, IQuoteBase } from '@komgo/types'
import { rdDiscountingSchema, rdQuoteSchema } from './constants'
import { FormikContext } from 'formik'
import { ALL_VALIDATION_FIELDS } from './RDValidator'
import { findFieldFromSchema } from '../../../store/common/selectors/displaySelectors'

type ITitleCreator<T> = (data: T, field: string) => string

const receivablesDiscountingTitle = (rd: IReceivablesDiscountingBase, field: keyof IReceivablesDiscountingBase) => {
  return findFieldFromSchema('title', field, rdDiscountingSchema)
}

const formikErrors = <T>(formik: FormikContext<T>, title: ITitleCreator<T>) => {
  const touchedErrors: object = findTouchedErrors(formik.errors, formik.touched)
  return Object.keys(touchedErrors).map(field => touchedErrors[field].replace(field, title(formik.values, field)))
}

export const formikRdErrors = (formik: FormikContext<IReceivablesDiscountingBase>) =>
  [...formikErrors(formik, receivablesDiscountingTitle), formik.errors[ALL_VALIDATION_FIELDS]].filter(Boolean)

export const formikQuoteAcceptedErrors = (formik: FormikContext<IQuoteBase>) => {
  const touchedErrors: any = findTouchedErrors(formik.errors, formik.touched)
  const errors = Object.keys(touchedErrors).map(field => {
    return touchedErrors[field].replace(field, findFieldFromSchema('title', field, rdQuoteSchema))
  })
  return [...errors, formik.errors[ALL_VALIDATION_FIELDS]].filter(Boolean)
}
