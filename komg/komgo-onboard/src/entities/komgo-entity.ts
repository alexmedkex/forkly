import { Type } from 'class-transformer'
import { IsDate, IsDefined, IsOptional, IsString, ValidateNested, IsBoolean } from 'class-validator'
import 'reflect-metadata'

import { X500NameEntity, MessagePublicKeyEntity, EthPublicKeyEntity, VaktEntity, QAEntity, FeatureEntity } from '.'

export class KomgoEntity {
  @IsOptional()
  @IsString()
  staticId: string

  @IsOptional()
  @IsString()
  komgoMnid: string

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
  @Type(() => MessagePublicKeyEntity)
  messagingPublicKey: MessagePublicKeyEntity

  @IsOptional()
  @ValidateNested()
  @Type(() => EthPublicKeyEntity)
  ethereumPublicKey: EthPublicKeyEntity

  @IsOptional()
  @IsString()
  nodeKeys: string

  @IsOptional()
  @ValidateNested()
  @Type(() => VaktEntity)
  vakt: VaktEntity

  @IsOptional()
  @ValidateNested()
  @Type(() => QAEntity)
  QAOnly: QAEntity

  @IsDefined()
  @ValidateNested()
  @Type(() => FeatureEntity)
  komgoProducts: FeatureEntity[]
}
