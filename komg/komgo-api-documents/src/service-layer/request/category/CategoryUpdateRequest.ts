import { IsDefined, Length } from 'class-validator'

import { MAX_NAME_LENGTH, MIN_NAME_LENGTH } from '../../../business-layer/validation/consts'

export class CategoryUpdateRequest {
  @IsDefined()
  id: string

  @Length(MIN_NAME_LENGTH, MAX_NAME_LENGTH)
  name: string
}
