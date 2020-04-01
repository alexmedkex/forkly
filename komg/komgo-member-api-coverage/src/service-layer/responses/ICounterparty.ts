import { IX500Name } from '@komgo/types'

export interface ICounterparty {
  staticId: string
  hasSWIFTKey: boolean
  isFinancialInstitution: boolean
  isMember: boolean

  x500Name: IX500Name

  covered?: boolean
  status: string
  coverageRequestId?: string
  timestamp?: Date
}

export interface ICounterpartyRequest extends ICounterparty {
  requestId: string
}
