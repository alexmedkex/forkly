import { IsOptional, IsString, ValidateNested, IsBoolean, IsNumber } from 'class-validator'
import 'reflect-metadata'

export class RegistryMessagePublicKeyEntity {
  @IsOptional()
  @IsString()
  // tslint:disable-next-line:variable-name
  _id: string

  @IsOptional()
  @IsString()
  key: string

  @IsOptional()
  @IsNumber()
  termDate: number

  @IsOptional()
  @IsBoolean()
  current: boolean

  @IsOptional()
  @IsBoolean()
  revoked: boolean
}
