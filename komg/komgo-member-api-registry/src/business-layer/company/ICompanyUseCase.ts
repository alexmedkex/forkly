import Company from '../../data-layer/models/Company'

export default interface ICompanyUseCase {
  createCompany(company: Company): Promise<string>
}
