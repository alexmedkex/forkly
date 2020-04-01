import { ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator'

@ValidatorConstraint({ name: 'isObject', async: false })
export class IsObject implements ValidatorConstraintInterface {
  validate(value: any, _args: ValidationArguments) {
    if (value === null || value === undefined) return true

    if (typeof value === 'object') return true

    return false
  }

  defaultMessage(args: ValidationArguments) {
    return `${args.property} is not an object`
  }
}
