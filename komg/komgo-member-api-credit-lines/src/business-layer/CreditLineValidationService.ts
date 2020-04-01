import { ErrorCode } from '@komgo/error-utilities'
import { getLogger } from '@komgo/logging'
import { ErrorUtils, IValidationErrors } from '@komgo/microservice-config'
import { ICreditLineSaveRequest, CREDIT_LINE_REQUEST_SCHEMA } from '@komgo/types'
import { injectable, inject } from 'inversify'

import { TYPES } from '../inversify/types'
import { ErrorName } from '../utils/Constants'

import { ICompanyClient } from './clients/ICompanyClient'
import { ICounterpartyClient } from './clients/ICounterpartyClient'
import InvalidDataError from './errors/InvalidDataError'
import { ValidationError } from './errors/ValidationError'
import { ValidationServiceBase } from './ValidationServiceBase'

const Ajv = require('ajv')

export interface ICreditLineValidationService {
  validate(request: ICreditLineSaveRequest, isFinancialInstitution: boolean)
  validateRiskCover(request: ICreditLineSaveRequest)
  validateBankLine(request: ICreditLineSaveRequest)
  validateCreditLineOwner(staticId: string)
  validateNonFinanceInstitution(staticId: string)
  validateFinanceInstitution(staticId: string)
  validateCreditLineCounterparty(staticId: string, isFinancialInstitution: boolean)
}

@injectable()
export class CreditLineValidationService extends ValidationServiceBase implements ICreditLineValidationService {
  private readonly logger = getLogger('CreditLineValidationService')
  private ajv

  constructor(
    @inject(TYPES.CounterpartyClient) counterpartyClient: ICounterpartyClient,
    @inject(TYPES.CompanyClient) companyClient: ICompanyClient
  ) {
    super(counterpartyClient, companyClient)
    this.ajv = new Ajv({ allErrors: true })
  }

  public async validate(request: ICreditLineSaveRequest, isFinancialInstitution: boolean = false) {
    if (!this.ajv.validate(CREDIT_LINE_REQUEST_SCHEMA, request)) {
      const validationErrors = this.formatValidationErrors(this.ajv.errors)
      throw new ValidationError('Invalid credit line format.', ErrorCode.ValidationHttpSchema, validationErrors)
    }

    try {
      await this.validateCreditLineCounterparty(request.counterpartyStaticId, isFinancialInstitution)
    } catch (error) {
      this.logger.error(ErrorCode.DatabaseInvalidData, ErrorName.CreditLineInvalidData, error.message)
      throw new ValidationError('Invalid company static id.', ErrorCode.DatabaseInvalidData, {
        counterpartyStaticId: [error.message]
      })
    }

    const counterpartiesSharedWith =
      request.sharedCreditLines && request.sharedCreditLines.length > 0
        ? request.sharedCreditLines.map(x => x.sharedWithStaticId)
        : []

    const failedCounterparties = await this.checkCounterparties(counterpartiesSharedWith, false)
    if (failedCounterparties && failedCounterparties.length > 0) {
      this.logger.error(
        ErrorCode.DatabaseInvalidData,
        ErrorName.CreditLineInvalidData,
        `Counterparties not found: ${failedCounterparties.join(',')}`
      )
      throw new ValidationError(`Company not found in counterparties`, ErrorCode.DatabaseInvalidData, {
        sharedCreditLines: [`Counterparties not found: ${failedCounterparties.join(',')}`]
      })
    }
  }

  public async validateRiskCover(request: ICreditLineSaveRequest) {
    await this.validate(request, false)
  }

  public async validateBankLine(request: ICreditLineSaveRequest) {
    await this.validate(request, true)
  }

  public async validateNonFinanceInstitution(staticId: string) {
    const company = await this.companyClient.getCompanyByStaticId(staticId)

    if (!company) {
      throw new InvalidDataError(`Company with ${staticId} does not exist in registry`)
    }

    if (company.isFinancialInstitution) {
      throw new InvalidDataError(`Company with ${staticId} is financial institution`)
    }

    return company
  }

  public async validateFinanceInstitution(staticId: string) {
    const company = await this.companyClient.getCompanyByStaticId(staticId)

    if (!company) {
      throw new InvalidDataError(`Company with ${staticId} does not exist in registry`)
    }

    if (!company.isFinancialInstitution) {
      throw new InvalidDataError(`Company with ${staticId} is not financial institution`)
    }

    return company
  }

  public async validateCreditLineCounterparty(staticId: string, isFinancialInstitution: boolean = false) {
    return this.checkCompany(staticId, isFinancialInstitution)
  }

  public async validateCreditLineOwner(staticId: string) {
    return this.checkCompany(staticId, true)
  }
}
