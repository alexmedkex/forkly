import { IsDefined, ValidateNested, IsDate, IsString, IsOptional } from 'class-validator'

import { KeyValueRequest } from '../KeyValueRequest'

import { DocumentContent } from './DocumentContent'
import { Owner } from './Owner'

export class UpdateDocumentRequest {
  @IsDefined()
  @IsString()
  id: string
  productId: string
  categoryId: string
  typeId: string

  @IsOptional()
  context?: any

  @IsOptional()
  @IsString()
  name?: string

  @IsOptional()
  @IsDate()
  registrationDate?: Date

  @IsOptional()
  @IsDefined()
  @ValidateNested()
  metadata?: KeyValueRequest[]

  @IsOptional()
  @IsDefined()
  @ValidateNested()
  owner?: Owner

  @IsDefined()
  state?: string

  content?: DocumentContent
  sharedWith?: string[]
}
