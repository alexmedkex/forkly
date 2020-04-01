import { Type } from 'class-transformer'
import { IsDefined, Length, ValidateNested } from 'class-validator'

import { MAX_NAME_LENGTH, MIN_NAME_LENGTH } from '../../../business-layer/validation/consts'

import { TypeFieldCreateRequest } from './TypeFieldCreateRequest'

export class TypeCreateRequest {
  @IsDefined()
  categoryId: string

  @Length(MIN_NAME_LENGTH, MAX_NAME_LENGTH)
  name: string

  @Type(() => TypeFieldCreateRequest)
  @IsDefined()
  @ValidateNested()
  fields: TypeFieldCreateRequest[]
}
