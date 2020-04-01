import { IsDefined, Length } from 'class-validator'

import { FieldType } from '../../../FieldTypes'
import { MIN_NAME_LENGTH, MAX_NAME_LENGTH } from '../../validation/consts'

export class TypeFieldMessageData {
  @IsDefined()
  id: string

  @Length(MIN_NAME_LENGTH, MAX_NAME_LENGTH)
  name: string

  @IsDefined()
  type: FieldType

  @IsDefined()
  isArray: boolean
}
