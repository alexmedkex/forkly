import validateEmail from './validateEmail'

describe('validateEmail', () => {
  it('should return error when value is empty', () => {
    expect(validateEmail('Field')('')).toEqual("'Field' should not be empty")
  })

  it('should return error when value is not valid email', () => {
    expect(validateEmail('Field')('email@company')).toEqual("'Field' is not valid")
  })

  it('should not return error when value is valid email', () => {
    expect(validateEmail('Field')('email@company.com')).toBeUndefined()
  })
})
