import { Type } from 'class-transformer'
import { ArrayNotEmpty, IsArray, IsDefined, IsOptional, IsString } from 'class-validator'

import { Note } from '../outgoing-request/Note'

export class SendDocumentsRequest {
  @IsDefined()
  @IsArray()
  @ArrayNotEmpty()
  documents: string[]

  @IsDefined()
  @IsString()
  companyId: string

  @IsOptional()
  @IsString()
  requestId?: string

  @Type(() => Object)
  @IsOptional()
  context?: any

  @Type(() => Note)
  @IsOptional()
  note?: Note
}
