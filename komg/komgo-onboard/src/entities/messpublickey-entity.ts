import { Type } from 'class-transformer'
import { IsDate, IsDefined, IsOptional, IsString, ValidateNested, IsBoolean } from 'class-validator'
import 'reflect-metadata'

import { KeyEntity } from '.'

export class MessagePublicKeyEntity {
  @IsDefined()
  @Type(() => Date)
  validFrom: string

  @IsDefined()
  @Type(() => Date)
  validTo: string

  @IsOptional()
  @ValidateNested()
  @Type(() => KeyEntity)
  key: KeyEntity

  @IsOptional()
  @IsBoolean()
  current: boolean

  @IsOptional()
  @IsBoolean()
  revoked: boolean
}
