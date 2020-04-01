import validateRequiredField from './validateRequiredField'

describe('validateRequiredField', () => {
  it('should return error when value is empty', () => {
    expect(validateRequiredField('Field')('')).toEqual("'Field' should not be empty")
  })

  it('should not return error when value is not empty', () => {
    expect(validateRequiredField('Field')('not empty')).toBeUndefined()
  })
})
