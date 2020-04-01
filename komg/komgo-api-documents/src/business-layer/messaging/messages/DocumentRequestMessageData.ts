import { Type } from 'class-transformer'
import { IsDefined, ValidateNested, IsOptional, IsDate } from 'class-validator'

import { DocumentMessageData } from './DocumentMessageData'
import { DocumentRequestNoteData } from './DocumentRequestNoteData'
import { TypeMessageData } from './TypeMessageData'

export class DocumentRequestMessageData {
  @IsDefined()
  requestId: string

  @IsDefined()
  companyId: string

  @Type(() => TypeMessageData)
  @IsDefined()
  @ValidateNested()
  types: TypeMessageData[]

  @IsOptional()
  @Type(() => DocumentMessageData)
  @ValidateNested()
  forms?: DocumentMessageData[]

  @IsOptional()
  @Type(() => DocumentRequestNoteData)
  @ValidateNested()
  notes?: DocumentRequestNoteData[]

  @IsOptional()
  @IsDate()
  deadline?: Date
}
