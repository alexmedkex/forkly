import { Type } from 'class-transformer'
import { IsDefined, IsString, ValidateNested } from 'class-validator'
import 'reflect-metadata'

import { X500NameEntity, VaktEntity } from '.'

export class VaktOnlyKomgoEntity {
  @IsDefined()
  @IsString()
  staticId: string

  @IsDefined()
  @ValidateNested()
  @Type(() => X500NameEntity)
  x500Name: X500NameEntity

  @IsDefined()
  @ValidateNested()
  @Type(() => VaktEntity)
  vakt: VaktEntity
}
