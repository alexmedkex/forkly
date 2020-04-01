import { Type } from 'class-transformer'
import { Length, IsDefined, ValidateNested } from 'class-validator'

import { MIN_NAME_LENGTH, MAX_NAME_LENGTH } from '../../../business-layer/validation/consts'

import { TypeFieldRequest } from './TypeFieldRequest'

export class CustomTypeRequest {
  @Length(MIN_NAME_LENGTH, MAX_NAME_LENGTH)
  name: string

  @Type(() => TypeFieldRequest)
  @IsDefined()
  @ValidateNested()
  fields: TypeFieldRequest[]
}
