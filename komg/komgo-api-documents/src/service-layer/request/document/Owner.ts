import { IsString, IsDefined } from 'class-validator'

export class Owner {
  @IsString()
  @IsDefined()
  firstName: string
  lastName: string
  companyId: string
}
