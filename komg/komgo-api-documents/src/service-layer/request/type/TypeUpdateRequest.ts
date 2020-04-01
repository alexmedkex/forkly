import { Type } from 'class-transformer'
import { IsDefined, Length, ValidateNested } from 'class-validator'

import { MAX_NAME_LENGTH, MIN_NAME_LENGTH } from '../../../business-layer/validation/consts'

import { TypeFieldRequest } from './TypeFieldRequest'

export class TypeUpdateRequest {
  @IsDefined()
  id: string

  @IsDefined()
  categoryId: string

  @Length(MIN_NAME_LENGTH, MAX_NAME_LENGTH)
  name: string

  @Type(() => TypeFieldRequest)
  @IsDefined()
  @ValidateNested()
  fields: TypeFieldRequest[]
}
