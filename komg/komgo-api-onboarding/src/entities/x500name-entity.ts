import { IsDefined, IsString } from 'class-validator'

export class X500NameEntity {
  @IsDefined()
  @IsString()
  CN: string

  @IsDefined()
  @IsString()
  O: string

  @IsDefined()
  @IsString()
  C: string

  @IsDefined()
  @IsString()
  L: string

  @IsDefined()
  @IsString()
  STREET: string

  @IsDefined()
  @IsString()
  PC: string
}
