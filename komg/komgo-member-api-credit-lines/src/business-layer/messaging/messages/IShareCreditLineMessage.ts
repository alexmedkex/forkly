import { Currency, IProductContext } from '@komgo/types'

import { ICreditLineBaseMessage, ICreditLineMessage } from './ICreditLineMessage'

export interface ISharedCreditLineMessage extends ICreditLineMessage<ISharedCreditLinePayload> {}

export interface ISharedCreditLinePayload {
  context: IProductContext
  counterpartyStaticId: string
  data?: ISharedCreditLineData
}

export interface ISharedCreditLineData {
  appetite: boolean
  availability?: boolean
  availabilityAmount?: number
  creditLimit?: number
  currency?: Currency
}
