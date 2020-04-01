export interface ICompany {
  staticId: string
  hasSWIFTKey: boolean
  isFinancialInstitution: boolean
  isMember: boolean
  komgoMnid: string

  x500Name: {
    CN: string
    O: string
    C: string
    L: string
    STREET: string
    PC: string
  }

  status?: string
}
