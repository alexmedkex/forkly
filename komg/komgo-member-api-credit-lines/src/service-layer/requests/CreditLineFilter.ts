import { IProductContext, Currency } from '@komgo/types'
import { Allow } from 'class-validator'

export class CreditLineFilter {
  @Allow()
  staticId: string
  @Allow()
  counterpartyStaticId: string
  @Allow()
  context: IProductContext
  @Allow()
  appetite: boolean
  @Allow()
  currency: Currency
  @Allow()
  availability: boolean
  @Allow()
  availabilityAmount?: number
  @Allow()
  data?: any
}
