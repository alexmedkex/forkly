import { DepositLoanType, Currency, DepositLoanPeriod } from '@komgo/types'

import { FeatureType } from '../../../business-layer/enums/feature'

import { IMessage } from './Message'

export interface IRequestBaseMessage extends IMessage {
  featureType: FeatureType
  requestStaticId?: string
  companyStaticId: string
  recepientStaticId: string
}

export interface IDepositLoanRequestMessage<TData> extends IRequestBaseMessage {
  payload?: TData
}

export interface IDepositLoanRequestPayload {
  currency: Currency
  period: DepositLoanPeriod
  periodDuration: number
  type: DepositLoanType
  comment?: string
}
