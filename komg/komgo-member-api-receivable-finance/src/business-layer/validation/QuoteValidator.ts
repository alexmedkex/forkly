import { ErrorCode } from '@komgo/error-utilities'
import { getLogger } from '@komgo/logging'
import { toValidationErrors } from '@komgo/microservice-config'
import { QUOTE_EXTENDED_SCHEMA, IQuote, IQuoteBase, QUOTE_SCHEMA, IReceivablesDiscounting } from '@komgo/types'
import * as Ajv from 'ajv'
import { inject, injectable } from 'inversify'

import { ReceivablesDiscountingDataAgent } from '../../data-layer/data-agents'
import { ErrorName } from '../../ErrorName'
import { TYPES } from '../../inversify'
import { ValidationFieldError, EntityNotFoundError } from '../errors'

@injectable()
export class QuoteValidator {
  private readonly logger = getLogger('QuoteValidator')
  private readonly validator = new Ajv({ allErrors: true, $data: true })

  constructor(
    @inject(TYPES.ReceivablesDiscountingDataAgent) private readonly rdDataAgent: ReceivablesDiscountingDataAgent
  ) {}

  /**
   * Finds a RD and validates IQuote
   *
   * @param rdId ID of the RD associated with the quote
   * @param quote Quote to validate
   * @throws ValidationFieldError if schema validation fails
   */
  public async findRDAndValidate(rdId: string, quote: IQuote) {
    const rd = await this.rdDataAgent.findByStaticId(rdId)

    if (!rd) {
      const msg = 'Receivable discounting application not found when validating the quote'
      this.logger.error(ErrorCode.DatabaseMissingData, ErrorName.ReceivablesDiscountingNotFound, msg, {
        rdId,
        quote: quote.staticId
      })

      throw new EntityNotFoundError(msg)
    }

    this.validateFieldsExtended(quote, rd)
  }

  /**
   * Validates IQuote
   *
   * @param quote Quote to validate
   * @param requestType Request type of the RD associated with the quote
   * @param discountingType Discounting type of the RD associated with the quote
   *
   * @throws ValidationFieldError if schema validation fails
   */
  public validateFieldsBase(quote: IQuoteBase, rd: IReceivablesDiscounting) {
    const quoteForValidation = {
      ...quote,
      requestType: rd.requestType,
      discountingType: rd.discountingType,
      daysOfDiscountingProvided: this.hasTraderProvidedDaysOfDiscounting(rd.numberOfDaysDiscounting)
    }

    this.validateFields(QUOTE_SCHEMA, quoteForValidation)
  }

  /**
   * Validates IQuote
   *
   * @param quote Quote to validate
   * @param requestType Request type of the RD associated with the quote
   * @param discountingType Discounting type of the RD associated with the quote
   *
   * @throws ValidationFieldError if schema validation fails
   */
  public validateFieldsExtended(quote: IQuote, rd: IReceivablesDiscounting) {
    const quoteForValidation = {
      ...quote,
      requestType: rd.requestType,
      discountingType: rd.discountingType,
      daysOfDiscountingProvided: this.hasTraderProvidedDaysOfDiscounting(rd.numberOfDaysDiscounting),
      createdAt: new Date(quote.createdAt).toISOString(), // needed because can be Date from DB or string, this works in both cases
      updatedAt: new Date(quote.updatedAt).toISOString() // needed because can be Date from DB or string, this works in both cases
    }
    this.validateFields(QUOTE_EXTENDED_SCHEMA, quoteForValidation)
  }

  private validateFields(schema: object, quoteForValidation: object) {
    const valid = this.validator.validate(schema, quoteForValidation)

    if (!valid) {
      const validationErrors = toValidationErrors(this.validator.errors)
      this.logger.error(
        ErrorCode.ValidationHttpSchema,
        ErrorName.QuoteValidationFailed,
        'IQuote validation errored',
        validationErrors
      )
      throw new ValidationFieldError('quote validation failed', validationErrors)
    }
  }

  private hasTraderProvidedDaysOfDiscounting(rdDaysOfDiscounting: number) {
    return rdDaysOfDiscounting !== undefined && rdDaysOfDiscounting !== null
  }
}
