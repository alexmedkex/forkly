import { CreditLineRequestStatus } from '@komgo/types'
import { Allow } from 'class-validator'

export class CreditLineRequestFilter {
  @Allow()
  staticId: string
  @Allow()
  context: any
  @Allow()
  counterpartyStaticId: string
  @Allow()
  companyStaticId: string
  @Allow()
  status?: CreditLineRequestStatus
}
