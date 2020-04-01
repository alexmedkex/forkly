import { ErrorCode } from '@komgo/error-utilities'
import { getLogger } from '@komgo/logging'
import {
  ISaveDepositLoan,
  DepositLoanPeriod,
  Currency,
  SAVE_DEPOSIT_LOAN_SCHEMA,
  ISaveDepositLoanRequest
} from '@komgo/types'
import { injectable } from 'inversify'

import { ICurrencyAndPeriod } from '../../data-layer/models/IDepositLoanRequestDocument'
import { ValidationError } from '../errors/ValidationError'

const Ajv = require('ajv')

export interface IDepositLoanValidationService {
  validateDepositLoan(request: ISaveDepositLoan): void
  validateDepositLoanRequest(request: ISaveDepositLoanRequest | ICurrencyAndPeriod): void
}

@injectable()
export class DepositLoanValidationService implements IDepositLoanValidationService {
  private readonly logger = getLogger('DepositLoanValidationService')
  private ajv

  constructor() {
    this.ajv = new Ajv({ allErrors: true })
  }

  validateDepositLoan(request: ISaveDepositLoan): void {
    this.logger.info(`Validate ${request.type} request`, {
      type: request.type,
      currency: request.currency,
      period: request.period,
      periodDuration: request.periodDuration
    })

    this.validateCurrencyAndPeriod(request)

    this.validateSaveDepositLoan(request)
  }

  validateDepositLoanRequest(request: ISaveDepositLoanRequest | ICurrencyAndPeriod): void {
    this.logger.info(`Validate ${request.type} request`, {
      type: request.type,
      currency: request.currency,
      period: request.period,
      periodDuration: request.periodDuration
    })

    this.validateCurrencyAndPeriod(request)
  }

  private validateSaveDepositLoan(request: ISaveDepositLoan) {
    if (!this.ajv.validate(SAVE_DEPOSIT_LOAN_SCHEMA, request)) {
      const validationErrors = this.formatValidationErrors(this.ajv.errors)
      throw new ValidationError('Invalid credit line format.', ErrorCode.ValidationHttpSchema, validationErrors)
    }
  }

  private validatePeriodDuration(request: ISaveDepositLoan | ISaveDepositLoanRequest | ICurrencyAndPeriod) {
    const periodsDuration = [1, 2, 3, 6, 12]
    const errors = []

    if (request.period === DepositLoanPeriod.Overnight && request.periodDuration) {
      errors.push({
        message: `Period and period duration are not valid`,
        dataPath: 'periodDuration'
      })
    }

    if (
      request.period === DepositLoanPeriod.Months &&
      (!request.periodDuration || !periodsDuration.find(pd => pd === request.periodDuration))
    ) {
      errors.push({
        message: `Period and period duration are not valid`,
        dataPath: 'periodDuration'
      })
    }

    if (request.period === DepositLoanPeriod.Weeks && (!request.periodDuration || request.periodDuration !== 1)) {
      errors.push({
        message: `Period and period duration are not valid`,
        dataPath: 'periodDuration'
      })
    }

    return errors
  }

  private validateCurrencyAndPeriod(request: ISaveDepositLoan | ISaveDepositLoanRequest | ICurrencyAndPeriod) {
    const currencies = [Currency.CHF, Currency.EUR, Currency.GBP, Currency.JPY, Currency.USD]
    const errors = []

    if (!currencies.find(c => c === request.currency)) {
      errors.push({
        message: `Currency is not valid`,
        dataPath: 'currency'
      })
    }

    if (
      ![DepositLoanPeriod.Overnight, DepositLoanPeriod.Weeks, DepositLoanPeriod.Months].find(p => p === request.period)
    ) {
      errors.push({
        message: `Period is not valid`,
        dataPath: 'period'
      })
    }

    this.validatePeriodDuration(request).forEach(pde => errors.push(pde))

    if (errors.length) {
      const validationErrors = this.formatValidationErrors(
        errors.reduce((r, i) => {
          r.push(i)
          return r
        }, [])
      )
      throw new ValidationError(`Invalid ${request.type} format.`, ErrorCode.ValidationHttpSchema, validationErrors)
    }
  }

  private formatValidationErrors(errors: [object]) {
    const validationErrors = {}
    errors.map(error => {
      validationErrors[error['dataPath']] = [error['message']] // tslint:disable-line
    })
    return validationErrors
  }
}
