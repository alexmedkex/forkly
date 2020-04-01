import { IProductContext, Currency } from '@komgo/types'

export interface IDisclosedCreditLine {
  ownerStaticId: string
  staticId: string
  counterpartyStaticId: string
  context: IProductContext
  appetite: boolean
  currency: Currency
  availability: boolean
  availabilityAmount?: number
  creditLimit?: number
  data?: any
  createdAt: Date
  updatedAt: Date
  deletedAt?: Date
}
