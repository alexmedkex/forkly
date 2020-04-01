import { Type } from 'class-transformer'
import { IsDate, IsDefined, IsOptional, IsString, ValidateNested } from 'class-validator'

import { KeyValueRequest } from '../KeyValueRequest'

import { DocumentContent, Owner, SharedWith } from '.'

export class DocumentRequest {
  @IsDefined()
  @IsString()
  id: string
  documentId: string
  name: string
  productId: string
  categoryId: string
  typeId: string
  hash: string

  @Type(() => Owner)
  owner: Owner

  @Type(() => Object)
  @IsOptional()
  context: object

  @IsDefined()
  @IsDate()
  registrationDate: Date

  @Type(() => KeyValueRequest)
  metadata: KeyValueRequest[]

  @Type(() => DocumentContent)
  @IsOptional()
  content?: DocumentContent

  @Type(() => SharedWith)
  @IsOptional()
  @ValidateNested()
  sharedWith: SharedWith[]

  @Type(() => String)
  sharedBy: string
}
