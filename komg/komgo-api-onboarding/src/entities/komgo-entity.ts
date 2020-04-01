import { Type } from 'class-transformer'
import { IsDefined, IsOptional, IsString, ValidateNested } from 'class-validator'
import 'reflect-metadata'

import { MessagePublicKeyEntity, EthPublicKeyEntity, FeatureEntity } from '.'
import { UpdateKomgoEntity } from './update-komgo-entity'

export class KomgoEntity extends UpdateKomgoEntity {
  @IsOptional()
  @IsString()
  komgoMnid: string

  @IsOptional()
  @ValidateNested()
  @Type(() => MessagePublicKeyEntity)
  messagingPublicKey: MessagePublicKeyEntity

  @IsOptional()
  @ValidateNested()
  @Type(() => EthPublicKeyEntity)
  ethereumPublicKey: EthPublicKeyEntity

  @IsOptional()
  @IsString()
  nodeKeys: string

  @IsDefined()
  @ValidateNested()
  @Type(() => FeatureEntity)
  komgoProducts: FeatureEntity[]
}
