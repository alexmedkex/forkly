import 'jest'
import 'reflect-metadata'

import { IsObject } from './IsObject'
import { ValidationArguments } from 'class-validator'

const validationArguments: ValidationArguments = {
  value: null,
  constraints: [],
  object: null,
  property: 'property',
  targetName: 'targetName'
}

describe('IsObject', () => {
  const isObjectValidator = new IsObject()

  it('null is a valid value', () => {
    expect(isObjectValidator.validate(null, validationArguments)).toBe(true)
  })

  it('undefined is a valid value', () => {
    expect(isObjectValidator.validate(null, validationArguments)).toBe(true)
  })

  it('object is a valid value', () => {
    expect(isObjectValidator.validate({}, validationArguments)).toBe(true)
  })

  it('string is not a valid value', () => {
    expect(isObjectValidator.validate('123', validationArguments)).toBe(false)
  })
})
