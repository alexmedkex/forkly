import { FormikTouched, FormikErrors } from 'formik'
import _ from 'lodash'

export const isErrorActive = <T>(
  field: string,
  errors: FormikErrors<T>,
  touched: FormikTouched<T>,
  overrideTouched: boolean = false
): boolean => {
  if (overrideTouched) {
    return !!errors[field]
  }
  if (field.includes('.')) {
    const arrayField = field.split('.')
    let fieldTouched = touched
    arrayField.forEach(item => {
      if (!fieldTouched) {
        return false
      }
      fieldTouched = fieldTouched[item] || _.get(fieldTouched, item)
    })
    return !!(fieldTouched && errors[field])
  }
  return !!(errors[field] && touched[field])
}
