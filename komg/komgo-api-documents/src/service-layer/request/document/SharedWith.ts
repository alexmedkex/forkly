import { IsString, IsDefined, IsArray } from 'class-validator'

export class SharedWith {
  @IsString()
  @IsDefined()
  counterpartyId: string
  @IsArray()
  @IsDefined()
  sharedDates: Date[]
}
