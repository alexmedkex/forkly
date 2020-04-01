import { Type } from 'class-transformer'
import { Length, IsDefined, IsArray, ValidateNested } from 'class-validator'

import { MIN_NAME_LENGTH, MAX_NAME_LENGTH } from '../../../business-layer/validation/consts'
import { KeyValueRequest } from '../KeyValueRequest'

export class CreateTemplateRequest {
  @Length(MIN_NAME_LENGTH, MAX_NAME_LENGTH)
  name: string

  @IsArray()
  types: string[]

  @Type(() => KeyValueRequest)
  @IsDefined()
  @ValidateNested()
  metadata: KeyValueRequest[]
}
