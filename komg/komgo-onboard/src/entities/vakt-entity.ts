import { Type } from 'class-transformer'
import { IsDefined, IsOptional, IsString, IsBoolean, ValidateNested } from 'class-validator'
import 'reflect-metadata'

import { MessagePublicKeyEntity } from '.'

export class VaktEntity {
  @IsOptional()
  @IsString()
  staticId: string

  @IsDefined()
  @IsString()
  mnid: string

  @IsDefined()
  @ValidateNested()
  @Type(() => MessagePublicKeyEntity)
  messagingPublicKey: MessagePublicKeyEntity
}
