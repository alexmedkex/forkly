import { IsUUID, IsOptional } from 'class-validator'

export class RFPReply {
  @IsUUID()
  rdId: string

  @IsOptional()
  comment?: string
}
