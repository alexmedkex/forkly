import { Type } from 'class-transformer'
import { IsDate, IsDefined, IsOptional, IsString, ValidateNested, IsBoolean } from 'class-validator'
import 'reflect-metadata'

import { X500NameEntity, EthPublicKeyEntity } from '.'
import { RegistryMessagePublicKeyEntity } from './registry-mess-pub-key-entity'

export class ApiRegistryMemberEntity {
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
  @IsString()
  label: string

  @IsOptional()
  @IsString()
  node: string

  @IsOptional()
  @IsString()
  parentNode: string

  @IsOptional()
  @IsString()
  resolver: string

  @IsOptional()
  @IsString()
  owner: string

  @IsOptional()
  @ValidateNested()
  @Type(() => RegistryMessagePublicKeyEntity)
  komgoMessagingPubKeys: RegistryMessagePublicKeyEntity[]

  @IsOptional()
  @ValidateNested()
  @Type(() => EthPublicKeyEntity)
  ethPubKeys: EthPublicKeyEntity[]

  @IsOptional()
  @IsString()
  nodeKeys: string

  @IsOptional()
  @ValidateNested()
  @Type(() => RegistryMessagePublicKeyEntity)
  vaktMessagingPubKeys: RegistryMessagePublicKeyEntity[]

  @IsOptional()
  @IsString()
  vaktMnid: string

  @IsOptional()
  @IsString()
  vaktStaticId: string
}
