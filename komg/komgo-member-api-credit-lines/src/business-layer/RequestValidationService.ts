import { ErrorCode } from '@komgo/error-utilities'
import { getLogger } from '@komgo/logging'
import { ErrorUtils, IValidationErrors } from '@komgo/microservice-config'
import { ICreditLineSaveRequest, CREDIT_LINE_REQUEST_SCHEMA, ICreateCreditLineRequest } from '@komgo/types'
import { injectable, inject } from 'inversify'

import { TYPES } from '../inversify/types'
import { ErrorName } from '../utils/Constants'

import { ICompanyClient } from './clients/ICompanyClient'
import { ICounterpartyClient } from './clients/ICounterpartyClient'
import InvalidDataError from './errors/InvalidDataError'
import { ValidationError } from './errors/ValidationError'
import { ValidationServiceBase } from './ValidationServiceBase'

const Ajv = require('ajv')

export interface IRequestValidationService {
  validate(request: ICreateCreditLineRequest, isFinanceInstitution?: boolean)
}

@injectable()
export class RequestValidationService extends ValidationServiceBase implements IRequestValidationService {
  private readonly logger = getLogger('RequestValidationService')
  constructor(
    @inject(TYPES.CounterpartyClient) counterpartyClient: ICounterpartyClient,
    @inject(TYPES.CompanyClient) companyClient: ICompanyClient
  ) {
    super(counterpartyClient, companyClient)
  }

  public async validate(request: ICreateCreditLineRequest, isFinanceInstitution = false) {
    try {
      await this.checkCompany(request.counterpartyStaticId, isFinanceInstitution)
    } catch (error) {
      this.logger.error(ErrorCode.DatabaseInvalidData, ErrorName.CreditLineRequestInvalidData, error.message)
      throw new ValidationError('Invalid company static id.', ErrorCode.DatabaseInvalidData, {
        counterpartyStaticId: [error.message]
      })
    }

    const counterparties = request.companyIds || []
    const failedCounterparties = await this.checkCounterparties(counterparties, true)
    if (failedCounterparties && failedCounterparties.length > 0) {
      this.logger.error(
        ErrorCode.DatabaseInvalidData,
        ErrorName.CreditLineRequestInvalidData,
        `Counterparties not found: ${failedCounterparties.join(',')}`
      )
      throw new ValidationError(`Company not found in counterparties`, ErrorCode.DatabaseInvalidData, {
        companyIds: [`Counterparties not found: ${failedCounterparties.join(',')}`]
      })
    }
  }
}
