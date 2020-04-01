import { IX500Name } from '@komgo/types'

export interface ICoverageCompany {
  staticId: string
  hasSWIFTKey: boolean
  isFinancialInstitution: boolean
  isMember: boolean
  komgoMnid: string
  x500Name: IX500Name
  status?: string
}
