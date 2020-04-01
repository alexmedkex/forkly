import { Length } from 'class-validator'

import { MIN_NAME_LENGTH, MAX_NAME_LENGTH } from '../../../business-layer/validation/consts'

export class CategoryCreateRequest {
  @Length(MIN_NAME_LENGTH, MAX_NAME_LENGTH)
  name: string
}
