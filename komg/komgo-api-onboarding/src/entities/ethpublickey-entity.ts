import { Type } from 'class-transformer'
import { IsDefined, IsString, IsOptional } from 'class-validator'
import 'reflect-metadata'

export class EthPublicKeyEntity {
  @IsDefined()
  @IsString()
  address: string

  @IsDefined()
  @IsString()
  key: string

  @IsOptional()
  @IsString()
  keyCompressed: string

  @IsOptional()
  @Type(() => Date)
  validFrom: string

  @IsOptional()
  @Type(() => Date)
  validTo: string
}
