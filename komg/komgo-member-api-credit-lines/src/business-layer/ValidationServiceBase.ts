import { injectable, inject } from 'inversify'

import { TYPES } from '../inversify/types'

import { ICompanyClient } from './clients/ICompanyClient'
import { ICounterpartyClient } from './clients/ICounterpartyClient'
import InvalidDataError from './errors/InvalidDataError'

@injectable()
export class ValidationServiceBase {
  constructor(
    @inject(TYPES.CounterpartyClient) protected counterpartyClient: ICounterpartyClient,
    @inject(TYPES.CompanyClient) protected companyClient: ICompanyClient
  ) {}

  protected async checkCompany(staticId: string, isFinancialInstitution: boolean) {
    const company = await this.companyClient.getCompanyByStaticId(staticId)
    if (!company) {
      throw new InvalidDataError(`Company with ${staticId} does not exist in registry`)
    }

    if (company.isFinancialInstitution !== isFinancialInstitution) {
      throw new InvalidDataError(
        `Company with ${staticId} ${isFinancialInstitution ? 'is not' : `can't be`}  financial institution`
      )
    }

    return company
  }

  protected async checkCounterparties(staticIds: string[], isFinancialInstitution?: boolean): Promise<string[]> {
    if (!staticIds || staticIds.length === 0) {
      return []
    }

    const query = isFinancialInstitution !== undefined ? { isFinancialInstitution } : {}
    const counterparties = await this.counterpartyClient.getCounterparties(query)

    return staticIds.filter(
      companyId => !counterparties.find(counterparty => counterparty.staticId === companyId && counterparty.covered)
    )
  }

  protected formatValidationErrors(errors: [object]) {
    const validationErrors = {}
    errors.map(error => {
      validationErrors[error['dataPath']] = [error['message']] // tslint:disable-line
    })
    return validationErrors
  }
}
