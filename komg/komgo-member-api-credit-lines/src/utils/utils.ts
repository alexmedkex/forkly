import { ICompany } from '../business-layer/clients/ICompany'

export const getCompanyDisplayName = (company: ICompany) => {
  return company && company.x500Name ? company.x500Name.CN : '-'
}
