import { Type } from 'class-transformer'
import { IsDefined, Length, ValidateNested } from 'class-validator'

import { MAX_NAME_LENGTH, MIN_NAME_LENGTH } from '../../validation/consts'

import { TypeFieldMessageData } from './TypeFieldMessageData'

export class TypeMessageData {
  @IsDefined()
  id: string

  @IsDefined()
  productId: string

  @IsDefined()
  categoryId: string

  @Length(MIN_NAME_LENGTH, MAX_NAME_LENGTH)
  name: string

  @Type(() => TypeFieldMessageData)
  @IsDefined()
  @ValidateNested()
  fields: TypeFieldMessageData[]

  @IsDefined()
  predefined: boolean
}
