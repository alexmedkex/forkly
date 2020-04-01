export default class Company {
  private companyLabel: string
  private companyAddress: string

  constructor(companyLabel: string, companyAddress: string) {
    this.companyLabel = companyLabel
    this.companyAddress = companyAddress
  }

  get getLabel(): string {
    return this.companyLabel
  }

  get getCompanyAddress(): string {
    return this.companyAddress
  }
}
