import * as _ from 'lodash'

import { inject, injectable } from 'inversify'
import { getLogger } from '@komgo/logging'
import { ITradeDataAgent } from '../../data-layer/data-agents/ITradeDataAgent'
import { TYPES } from '../../inversify/types'
import { TradeKeys } from '../../data-layer/models/ITrade'

import { ErrorUtils } from '@komgo/microservice-config'
import { ErrorCode } from '@komgo/error-utilities'
import { ErrorName } from '../../utils/Constants'
import { ITradeValidator } from '../../data-layer/validation/TradeValidator'
import { ReceivableDiscountStatus } from '../../data-layer/constants/ReceivableDiscountStatus'
import { ITrade, ITradeBase } from '@komgo/types'

export interface ITradeValidationService {
  validateCreate(data: ITradeBase & { sourceId: string })
  validateUpdate(newTrade: ITrade, existingTrade: ITrade)
}

@injectable()
export class TradeValidationService implements ITradeValidationService {
  private readonly logger = getLogger('TradeController')
  private readonly tradeValidationFailed = 'Trade validation failed'

  constructor(
    @inject(TYPES.TradeDataAgent) private readonly tradeDataAgent: ITradeDataAgent,
    @inject(TYPES.TradeValidator) private readonly tradeValidator: ITradeValidator,
    @inject('company-static-id') private readonly companyStaticId: string
  ) {}

  async validateCreate(trade: ITrade) {
    const { source, sourceId } = trade
    const existingTradeWithId = await this.tradeDataAgent.findOne({ sourceId }, source)
    if (existingTradeWithId) {
      this.logger.error(
        ErrorCode.DatabaseInvalidData,
        ErrorName.InvalidTradeData,
        `Trade with same ID already exists. Source: ${source}, Id: ${sourceId}`
      )
      throw ErrorUtils.conflictException(
        ErrorCode.DatabaseInvalidData,
        `Trade with same ID already exists. Source: ${source}, Id: ${sourceId}`
      )
    }

    await this.checkForDuplicateEtrmId(trade.sellerEtrmId, 'sellerEtrmId')
    await this.checkForDuplicateEtrmId(trade.buyerEtrmId, 'buyerEtrmId')

    const errors = await this.tradeValidator.validate(trade)
    if (errors) {
      this.logger.error(
        ErrorCode.ValidationHttpSchema,
        ErrorName.TradeValidationFailed,
        this.tradeValidationFailed,
        errors
      )
      throw ErrorUtils.badRequestException(ErrorCode.ValidationHttpSchema, this.tradeValidationFailed, errors)
    }

    return true
  }

  async validateUpdate(newTrade: ITrade, existingTrade: ITrade) {
    const errors = await this.tradeValidator.validate(newTrade)
    if (errors) {
      this.logger.error(
        ErrorCode.ValidationHttpSchema,
        ErrorName.TradeValidationFailed,
        this.tradeValidationFailed,
        errors
      )
      throw ErrorUtils.badRequestException(ErrorCode.ValidationHttpSchema, this.tradeValidationFailed, errors)
    }

    if (
      existingTrade.seller === this.companyStaticId &&
      existingTrade.status !== ReceivableDiscountStatus.ToBeDiscounted
    ) {
      this.logger.error(
        ErrorCode.DatabaseInvalidData,
        ErrorName.InvalidTradeData,
        `Can't edit trade in status: ${existingTrade.status}`
      )
      throw ErrorUtils.badRequestException(
        ErrorCode.DatabaseInvalidData,
        `Can't edit trade in status: ${existingTrade.status}`,
        {
          status: [`Can't edit trade in status: ${existingTrade.status}`]
        }
      )
    }

    await this.validateFieldChanges(newTrade, existingTrade)

    if (this.hasEtrmChanged(existingTrade, newTrade, 'buyerEtrmId')) {
      await this.checkForDuplicateEtrmId(newTrade.buyerEtrmId, 'buyerEtrmId')
    }
    if (this.hasEtrmChanged(existingTrade, newTrade, 'sellerEtrmId')) {
      await this.checkForDuplicateEtrmId(newTrade.sellerEtrmId, 'sellerEtrmId')
    }
    return true
  }

  private async validateFieldChanges(newTrade: ITrade, existingTrade: ITrade) {
    let keys: TradeKeys[] = ['source', 'sourceId']
    if (this.companyStaticId === existingTrade.seller) {
      keys = _.union(keys, [`seller`, `creditRequirement`, `commodity`])
    }

    const diffKeys = this.getDifference(newTrade, existingTrade, keys)

    if (diffKeys && diffKeys.length > 0) {
      const changes = diffKeys.reduce((memo, key) => {
        return {
          [key]: [`Current: ${existingTrade[key]}, new: ${newTrade[key]}`],
          ...memo
        }
      }, {})
      this.logger.error(
        ErrorCode.DatabaseInvalidData,
        ErrorName.InvalidTradeData,
        `Can't change trade ${_.join(diffKeys)}`,
        {
          ...changes
        }
      )
      throw ErrorUtils.badRequestException(ErrorCode.DatabaseInvalidData, `Can't change trade: ${_.join(diffKeys)}`, {
        ...changes
      })
    }
  }

  private async checkForDuplicateEtrmId(etrmId: string, etrmIdName: 'buyerEtrmId' | 'sellerEtrmId') {
    if (!etrmId) {
      return
    }

    const ids = await this.tradeDataAgent.find({ [etrmIdName]: etrmId })
    if (ids && ids.length > 0) {
      const humanReadableEtrmFieldName = etrmIdName === 'buyerEtrmId' ? 'Buyer EtrmID' : 'Seller EtrmID'
      throw ErrorUtils.conflictException(
        ErrorCode.DatabaseInvalidData,
        `Trade with the same ${humanReadableEtrmFieldName} already exists. EtrmId: ${etrmId}`
      )
    }
  }

  private getDifference(first: object, second: object, keys: TradeKeys[]): string[] {
    return _.filter(keys, (key: string) => {
      return !_.eq(_.toString(first[key]), _.toString(second[key]))
    })
  }

  private hasEtrmChanged(existingTrade: ITrade, newTrade: ITrade, etrmIdName: 'buyerEtrmId' | 'sellerEtrmId'): boolean {
    return !_.isEqual(existingTrade[etrmIdName], newTrade[etrmIdName])
  }
}
