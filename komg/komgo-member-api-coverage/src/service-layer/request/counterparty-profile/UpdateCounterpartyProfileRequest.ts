import { IsString, IsEnum, IsDate, IsOptional } from 'class-validator'
import { RiskLevel } from '../../../data-layer/models/profile/enums'

export class UpdateCounterpartyProfileRequest {
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
