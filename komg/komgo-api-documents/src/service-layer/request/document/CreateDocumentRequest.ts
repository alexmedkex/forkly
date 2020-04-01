import { Type } from 'class-transformer'
import { IsArray, IsDefined, IsOptional, IsString, ValidateNested } from 'class-validator'

import { KeyValueRequest } from '../KeyValueRequest'

import { Owner } from './Owner'

export class CreateDocumentRequest {
  @Type(() => KeyValueRequest)
  @IsDefined()
  @ValidateNested()
  @IsArray()
  metadata: KeyValueRequest[]

  @IsDefined()
  @ValidateNested()
  owner: Owner

  @IsDefined()
  @IsString()
  name: string

  @IsOptional()
  context: object

  @IsOptional()
  comment: string
}
