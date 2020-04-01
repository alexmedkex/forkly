import { flatten } from 'lodash'

/**
 * This method returns list of error messages, which can be used in <MultiErrorMessage />
 * Input: errors: { field: 'Required field' }, touched: { field: true }
 * Output: ['Required field']
 */
export const getErrors = (errors: object, touched: object): string[] => {
  const res = Object.keys(errors).map(key => {
    const error = errors[key]
    const isTouched = touched && touched[key]
    if (isTouched) {
      return typeof error === 'string' ? error : getErrors(error, isTouched)
    }
  })
  return flatten(res).filter(el => !!el)
}
