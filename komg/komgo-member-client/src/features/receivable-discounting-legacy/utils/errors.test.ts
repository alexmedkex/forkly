import { formikRdErrors } from './errors'
import { ALL_VALIDATION_FIELDS } from './RDValidator'

describe('formikRdErrors', () => {
  it('should return no errors if there are no formik errors', () => {
    const formik = { errors: {}, touched: {} } as any
    expect(formikRdErrors(formik)).toEqual([])
  })

  it('should not return errors if there are untouched formik errors', () => {
    const formik = {
      errors: {
        advancedRate: 'field is invalid'
      },
      touched: {}
    } as any

    expect(formikRdErrors(formik)).toEqual([])
  })

  it('should return errors if there are touched formik errors', () => {
    const formik = {
      errors: {
        advancedRate: 'advance rate is invalid'
      },
      touched: { advancedRate: true }
    } as any

    expect(formikRdErrors(formik)).toEqual(['advance rate is invalid'])
  })

  it('should include validation errors on ALL, even if not touched', () => {
    const formik = {
      errors: {
        [ALL_VALIDATION_FIELDS]: 'nothing changed'
      },
      touched: {}
    } as any

    expect(formikRdErrors(formik)).toEqual(['nothing changed'])
  })
})
