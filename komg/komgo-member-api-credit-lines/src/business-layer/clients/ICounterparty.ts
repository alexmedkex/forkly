export interface ICounterparty {
  staticId: string
  hasSWIFTKey: boolean
  isFinancialInstitution: boolean
  isMember: boolean

  x500Name: {
    CN: string
    O: string
    C: string
    L: string
    STREET: string
    PC: string
  }

  covered?: boolean
  status: string
  coverageRequestId?: string
  timestamp?: Date
}
