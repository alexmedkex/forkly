import { number, object, boolean } from 'yup'
import { IRequestDocumentForm } from '../containers/RequestDocumentsContainer'

const requestDocumentValidator = (values: IRequestDocumentForm) => {
  let errors = {}

  const schema = object({
    isDeadlineOn: boolean(),
    deadlineDateAmount: number().when('isDeadlineOn', {
      is: true,
      then: () =>
        number()
          .typeError('Add valid value')
          .min(0, 'Add valid value')
          .test('is zero', 'Add value', value => value !== 0)
    })
  })

  try {
    schema.validateSync(values, { abortEarly: false })
  } catch (err) {
    const errorsTransformed = err.inner.reduce((obj, e) => {
      obj[e.path] = e.message
      return obj
    }, {})
    errors = { ...errors, ...errorsTransformed }
  }

  return errors
}

export { requestDocumentValidator }
