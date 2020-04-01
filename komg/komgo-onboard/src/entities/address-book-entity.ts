import { Type } from 'class-transformer'
import { IsDefined, IsString, ValidateNested } from 'class-validator'
import 'reflect-metadata'
import { MessagePublicKeyEntity } from '.'

export class AddressBookEntity {
  @IsDefined()
  @IsString()
  staticId: string

  @IsDefined()
  @IsString()
  businessName: string

  @IsDefined()
  @IsString()
  mnid: string

  @IsDefined()
  @Type(() => Date)
  updated: string

  @IsDefined()
  @ValidateNested()
  @Type(() => MessagePublicKeyEntity)
  publicKeyInfoHistory: MessagePublicKeyEntity[]
}
