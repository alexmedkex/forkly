import { Type } from 'class-transformer'
import { IsDate, IsDefined, IsOptional, IsString, ValidateNested, IsBoolean } from 'class-validator'
import 'reflect-metadata'

import { MessagePublicKeyEntity, EthPublicKeyEntity, VaktEntity, KeyEntity } from '.'

export class QAEntity {
  @IsDefined()
  @ValidateNested()
  @Type(() => KeyEntity)
  QAPrivateMessagingKey: KeyEntity

  @IsOptional()
  @IsString()
  QAEthereumPrivateKey: string
}
