import { Type } from 'class-transformer'
import { IsDefined, ValidateNested } from 'class-validator'

import { DocumentReviewUpdate } from './DocumentReviewUpdate'

export class DocumentsReviewUpdate {
  @Type(() => DocumentReviewUpdate)
  @IsDefined()
  @ValidateNested()
  documents: DocumentReviewUpdate[]
}
