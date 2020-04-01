import { IsDefined, IsEnum, Length } from 'class-validator'

import { MAX_NAME_LENGTH, MIN_NAME_LENGTH } from '../../../business-layer/validation/consts'
import { FieldType } from '../../../FieldTypes'

export class TypeFieldRequest {
  id?: string

  @Length(MIN_NAME_LENGTH, MAX_NAME_LENGTH)
  name: string

  @IsEnum(FieldType)
  type: FieldType

  @IsDefined()
  isArray: boolean
}
