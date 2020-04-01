import { Type } from 'class-transformer'
import { IsOptional, IsBoolean, IsDefined, IsArray, IsString } from 'class-validator'

export class SendDocumentsRequestExtended {
  @IsDefined()
  @IsArray()
  documents: string[]

  @IsDefined()
  @IsString()
  companyId: string

  @IsOptional()
  @IsString()
  requestId?: string

  @IsOptional()
  @IsBoolean()
  reviewNotRequired?: boolean

  @Type(() => Object)
  @IsOptional()
  context?: any
}
