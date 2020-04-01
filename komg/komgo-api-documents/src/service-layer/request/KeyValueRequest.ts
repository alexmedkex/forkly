import { Length, IsString } from 'class-validator'

import { MIN_NAME_LENGTH, MAX_NAME_LENGTH } from '../../business-layer/validation/consts'

export class KeyValueRequest {
  @Length(MIN_NAME_LENGTH, MAX_NAME_LENGTH)
  @IsString()
  name: string

  @Length(MIN_NAME_LENGTH, MAX_NAME_LENGTH)
  @IsString()
  value: string
}
