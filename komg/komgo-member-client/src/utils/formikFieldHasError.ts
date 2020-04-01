import { FormikErrors, FormikTouched } from 'formik'

export const hasError = <T>(field: keyof T, errors: FormikErrors<T>, touched: FormikTouched<T>) =>
  errors[field] && touched[field]
