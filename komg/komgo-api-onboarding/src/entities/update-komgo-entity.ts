import { Type } from 'class-transformer'
import { IsDefined, IsOptional, IsString, ValidateNested, IsBoolean } from 'class-validator'
import 'reflect-metadata'

import { X500NameEntity, VaktEntity } from '.'

export class UpdateKomgoEntity {
  @IsOptional()
  @IsString()
  staticId: string

  @IsDefined()
  @ValidateNested()
  @Type(() => X500NameEntity)
  x500Name: X500NameEntity

  @IsDefined()
  @IsBoolean()
  hasSWIFTKey: boolean

  @IsDefined()
  @IsBoolean()
  isFinancialInstitution: boolean

  @IsDefined()
  @IsBoolean()
  isMember: boolean

  @IsOptional()
  @ValidateNested()
  @Type(() => VaktEntity)
  vakt: VaktEntity

  @IsOptional()
  @IsString()
  memberType: string
}
