import { Allow } from 'class-validator'

export class SBLCRequest {
  @Allow()
  tradeId?: {
    sourceId?: string | number | object
  }

  @Allow()
  issuingBankId?: string

  @Allow()
  reference?: string
}
