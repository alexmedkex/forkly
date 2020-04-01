import { IsDefined, IsOptional, IsString } from 'class-validator'
import 'reflect-metadata'

export class KeyEntity {
  @IsDefined()
  @IsString()
  kty: string

  @IsDefined()
  @IsString()
  kid: string

  @IsDefined()
  @IsString()
  e: string

  @IsDefined()
  @IsString()
  n: string

  @IsOptional()
  @IsString()
  d: string

  @IsOptional()
  @IsString()
  p: string

  @IsOptional()
  @IsString()
  q: string

  @IsOptional()
  @IsString()
  dp: string

  @IsOptional()
  @IsString()
  dq: string

  @IsOptional()
  @IsString()
  qi: string
}
