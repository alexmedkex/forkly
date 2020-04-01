import { ErrorCode } from '@komgo/error-utilities'
import { getLogger } from '@komgo/logging'
import { INotificationCreateRequest } from '@komgo/notification-publisher'
import { IProductContext, ICreditLineSaveRequest, ICreateCreditLineRequest } from '@komgo/types'
import { injectable, inject } from 'inversify'

import { TYPES } from '../inversify/types'

import { ICreditLineValidationService } from './CreditLineValidationService'
import { CreditLineValidationType } from './CreditLineValidationType'
import { ValidationError } from './errors/ValidationError'
import { SUB_PRODUCT_ID, PRODUCT_ID } from './notifications/enums'
import { IRequestValidationService } from './RequestValidationService'

export interface ICreditLineValidationFactory {
  getCreditLineValidation(type: CreditLineValidationType, data: ICreditLineSaveRequest | ICreateCreditLineRequest)
}

@injectable()
export class CreditLineValidationFactory implements ICreditLineValidationFactory {
  static ValidationType(context: IProductContext, request = false) {
    if (context.productId === PRODUCT_ID.TradeFinance && context.subProductId === SUB_PRODUCT_ID.RiskCover) {
      return !request ? CreditLineValidationType.ValidateRiskCover : CreditLineValidationType.ValidateRiskCoverRequest
    } else if (context.productId === PRODUCT_ID.TradeFinance && context.subProductId === SUB_PRODUCT_ID.BankLine) {
      return !request ? CreditLineValidationType.ValidateBankLine : CreditLineValidationType.ValidateBankLineRequest
    }

    throw new ValidationError(`Received request doesn't have valid context`, ErrorCode.ValidationInvalidOperation, null)
  }

  private readonly logger = getLogger('CreditLineValidationFactory')
  private readonly strategies = new Map<
    CreditLineValidationType,
    (
      type: CreditLineValidationType,
      data: ICreditLineSaveRequest | ICreateCreditLineRequest
    ) => INotificationCreateRequest
  >()

  constructor(
    @inject(TYPES.CreditLineValidationService)
    private readonly creditLineValidationService: ICreditLineValidationService,
    @inject(TYPES.RequestValidationService) private readonly requestValidationService: IRequestValidationService
  ) {
    this.setupStrategies()
  }

  getCreditLineValidation(type: CreditLineValidationType, data: ICreditLineSaveRequest | ICreateCreditLineRequest) {
    return this.strategies.get(type)(type, data)
  }

  async validateRiskCover(type: CreditLineValidationType, request: ICreditLineSaveRequest) {
    this.logger.info('Validate risk cover request...')
    await this.creditLineValidationService.validateRiskCover(request)
  }

  async validateBankLine(type: CreditLineValidationType, request: ICreditLineSaveRequest) {
    this.logger.info('Validate bank line request...')
    await this.creditLineValidationService.validateBankLine(request)
  }

  async validateRiskCoverRequest(type: CreditLineValidationType, request: ICreateCreditLineRequest) {
    this.logger.info('Validate credit line request...')
    await this.requestValidationService.validate(request, false)
  }

  async validateBankLineRequest(type: CreditLineValidationType, request: ICreateCreditLineRequest) {
    this.logger.info('Validate credit line request...')
    await this.requestValidationService.validate(request, true)
  }

  private setupStrategies(): any {
    this.strategies.set(CreditLineValidationType.ValidateRiskCover, this.validateRiskCover.bind(this))
    this.strategies.set(CreditLineValidationType.ValidateBankLine, this.validateBankLine.bind(this))
    this.strategies.set(CreditLineValidationType.ValidateRiskCoverRequest, this.validateRiskCoverRequest.bind(this))
    this.strategies.set(CreditLineValidationType.ValidateBankLineRequest, this.validateBankLineRequest.bind(this))
  }
}
