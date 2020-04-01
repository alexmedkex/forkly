import { FormikErrors, FormikTouched } from 'formik'
import _ from 'lodash'

export const findTouchedErrors = (errors: FormikErrors<any>, touched: FormikTouched<any>): FormikErrors<any> => {
  const touchedErrors = {}
  Object.keys(errors).forEach(field => {
    if (field.includes('.')) {
      const arrayField = field.split('.')
      let fieldTouched: any = touched
      arrayField.forEach(item => {
        if (fieldTouched[item]) {
          fieldTouched = fieldTouched[item]
        }
      })
      if (fieldTouched === true) {
        touchedErrors[field] = errors[field]
      }
    } else if (touched[field]) {
      touchedErrors[field] = errors[field]
    }
  })
  return touchedErrors
}

export const findFormikErrors = (errors: FormikErrors<any>, touched: FormikTouched<any>): FormikErrors<any> => {
  const touchedErrors = {}
  Object.keys(errors).forEach(field => {
    if (_.get(touched, field)) {
      touchedErrors[field] = errors[field]
    }
  })
  return touchedErrors
}
