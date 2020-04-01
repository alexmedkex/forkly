import { Currency } from '@komgo/types'

import { ITimerResponse } from '../../business-layer/timers/ITimer'

export interface ICreateLCResponse {
  _id: string
  reference: string // e.g. LC18-MER-0001
}

export interface IRequestLCResponse {
  applicantId: string
  applicantContactPerson: string
  beneficiaryId: string
  beneficiaryContactPerson: string
  issuingBankId: string
  issuingBankContactPerson: string
  direct: boolean
  beneficiaryBankId: string
  beneficiaryBankContactPerson: string
  beneficiaryBankRole: string
  tradeId: string
  type: string
  applicableRules: string
  feesPayableBy: string
  currency: Currency
  amount: number
  expiryDate: number | string | Date
  expiryPlace: string
  availableWith: string
  availableBy: string
  partialShipmentAllowed: boolean
  transhipmentAllowed: boolean
  documentPresentationDeadlineDays: number
  comments: string
  reference: string
  cargoIds: string[]
  timer?: ITimerResponse
}
