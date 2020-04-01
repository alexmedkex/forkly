import { requestDocumentValidator } from './validator'
import { IRequestDocumentForm, requestDocumentFormDefaultValue } from '../containers/RequestDocumentsContainer'

describe('requestDocumentValidator', () => {
  it('should return empty errors per default since isDeadlineOn is false', () => {
    expect(requestDocumentValidator(requestDocumentFormDefaultValue)).toEqual({})
  })
  it('should return errors for add value if isDeadlineOn on and deadlineDateAmount is 0', () => {
    expect(
      requestDocumentValidator({ ...requestDocumentFormDefaultValue, isDeadlineOn: true, deadlineDateAmount: 0 })
    ).toEqual({
      deadlineDateAmount: 'Add value'
    })
  })
  it('should return errors for add value if isDeadlineOn on and deadlineDateAmount is -2', () => {
    expect(
      requestDocumentValidator({ ...requestDocumentFormDefaultValue, isDeadlineOn: true, deadlineDateAmount: -2 })
    ).toEqual({
      deadlineDateAmount: 'Add valid value'
    })
  })
})
