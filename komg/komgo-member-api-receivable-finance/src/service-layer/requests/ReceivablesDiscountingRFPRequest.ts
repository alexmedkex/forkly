import { ArrayNotEmpty, IsUUID } from 'class-validator'

export class ReceivablesDiscountingRFPRequest {
  @IsUUID()
  rdId: string

  @ArrayNotEmpty()
  participantStaticIds: string[]
}
