import { IProductContext, CreditLineRequestType, CreditLineRequestStatus } from '@komgo/types'

export interface ICreditLineRequestDocument {
  staticId: string
  requestType: CreditLineRequestType // CreditLineRequestType
  context: IProductContext
  comment: string
  counterpartyStaticId: string
  companyStaticId: string
  status: CreditLineRequestStatus

  createdAt: Date
  updatedAt: Date
  deletedAt?: Date
}
