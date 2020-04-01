import { IsDefined, IsString, IsEnum, IsDate, IsOptional } from 'class-validator'
import { RiskLevel } from '../../../data-layer/models/profile/enums'

export class CreateCounterpartyProfileRequest {
  @IsDefined()
  @IsString()
  counterpartyId: string

  @IsString()
  @IsEnum(RiskLevel)
  @IsOptional()
  riskLevel?: string

  @IsDate()
  @IsOptional()
  renewalDate?: Date

  @IsString()
  @IsOptional()
  managedById?: string
}
