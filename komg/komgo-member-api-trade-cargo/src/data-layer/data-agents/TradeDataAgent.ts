import { inject, injectable } from 'inversify'
import { getLogger } from '@komgo/logging'
import { TradeRepo } from '../mongodb/TradeRepo'

import { ITradeDataAgent } from './ITradeDataAgent'
import { LOC_STATUS } from '../constants/LetterOfCreditStatus'
import { TYPES } from '../../inversify/types'
import { IMemberClient } from '../clients/IMemberClient'

import { CRUD_ACTIONS } from '../../data-layer/constants/CRUDActions'
import { ENTITY_TYPES } from '../constants/EntityTypes'
import { LOGGER_MESSAGES } from '../constants/LoggerMessages'
import { DataAccessException, DATA_ACCESS_ERROR } from '../exceptions/DataAccessException'
import { ErrorCode } from '@komgo/error-utilities'
import { ErrorName } from '../../utils/Constants'
import { ITrade } from '@komgo/types'
import { toObject } from './utils/toObject'

const COUNTERPARTIES = {
  SELLER: 'seller',
  BUYER: 'buyer'
}

@injectable()
export default class TradeDataAgent implements ITradeDataAgent {
  private readonly logger = getLogger('TradeDataAgent')

  constructor(@inject(TYPES.MemberClient) private memberClient: IMemberClient) {}
  async find(
    filter: object,
    projection: object = {},
    options = { skip: undefined, limit: undefined }
  ): Promise<ITrade[]> {
    const { skip, limit } = options
    const query = this.appendDefaultFilter(filter)
    return TradeRepo.find(query, projection, options)
      .skip(skip)
      .limit(limit)
      .lean()
  }

  async count(query: object): Promise<number> {
    return TradeRepo.countDocuments({ ...query, deletedAt: null })
  }

  async findOne(filter: object, source: string): Promise<ITrade> {
    const query = this.appendDefaultFilter({
      ...filter,
      source
    })
    return TradeRepo.findOne(query)
  }

  async update(id: string, trade: ITrade): Promise<ITrade> {
    await this.checkBuyerAndSeller(trade, CRUD_ACTIONS.UPDATE)

    const existingTrade = await TradeRepo.findOne({ _id: id, deletedAt: null })
    if (!existingTrade) {
      this.logger.error(ErrorCode.DatabaseMissingData, ErrorName.TradeNotFound, LOGGER_MESSAGES.NOT_FOUND, {
        action: CRUD_ACTIONS.UPDATE,
        entityType: ENTITY_TYPES.TRADE,
        id
      })
      throw new DataAccessException(DATA_ACCESS_ERROR.NOT_FOUND, `Trade ${id} not found`)
    }

    // silently ignore read only props because they are read only attributes
    const { source, _id, sourceId, status, createdAt, deletedAt, updatedAt, ...data } = trade
    return toObject(
      await TradeRepo.findOneAndUpdate(
        { _id: id },
        {
          ...data
        },
        { new: true }
      ).exec()
    )
  }

  async create(trade: ITrade): Promise<string> {
    let entity

    await this.checkBuyerAndSeller(trade, CRUD_ACTIONS.CREATE)

    try {
      entity = await TradeRepo.create(trade)
      return entity._id
    } catch (e) {
      this.logger.error(ErrorCode.DatabaseInvalidData, ErrorName.InvalidTradeData, e.message || e, {
        action: CRUD_ACTIONS.CREATE,
        entityType: ENTITY_TYPES.TRADE,
        source: trade.source,
        sourceId: trade.sourceId
      })
      throw e
    }
  }

  async delete(id: string): Promise<void> {
    const query = {
      _id: id,
      deletedAt: null
    }
    const result = await TradeRepo.updateOne(query, { deletedAt: Date.now() })
    if (!result.n) {
      this.logger.error(ErrorCode.DatabaseMissingData, ErrorName.TradeNotFound, LOGGER_MESSAGES.NOT_FOUND, {
        action: CRUD_ACTIONS.DELETE,
        entityType: ENTITY_TYPES.TRADE,
        id
      })
      throw new DataAccessException(DATA_ACCESS_ERROR.NOT_FOUND, `Trade ${id} not found`)
    }
    return undefined
  }

  async get(id: string): Promise<ITrade> {
    const query = {
      _id: id,
      deletedAt: null
    }
    const trade: ITrade = await TradeRepo.findOne(query)
    if (!trade) {
      this.logger.error(ErrorCode.DatabaseMissingData, ErrorName.TradeNotFound, LOGGER_MESSAGES.NOT_FOUND, {
        action: CRUD_ACTIONS.FIND_ONE,
        entityType: ENTITY_TYPES.TRADE,
        id
      })
      throw new DataAccessException(DATA_ACCESS_ERROR.NOT_FOUND, `Trade ${id} not found`)
    }
    return toObject(trade)
  }

  private async checkBuyerAndSeller(trade: ITrade, action: string) {
    const [buyerStaticId, sellerStaticId] = await Promise.all(
      Object.values(COUNTERPARTIES).map(async counterparty => this.validateCounterparty(counterparty, trade))
    )

    if (buyerStaticId === sellerStaticId) {
      this.logger.error(
        ErrorCode.DatabaseInvalidData,
        ErrorName.InvalidTradeData,
        'Distinct buyer and seller constraint',
        {
          action,
          entityType: ENTITY_TYPES.TRADE,
          buyerStaticId
        }
      )

      throw new DataAccessException(DATA_ACCESS_ERROR.INVALID_DATA, `Buyer and seller can't be same`, {
        details: [`buyer/seller id : ${buyerStaticId}`]
      })
    }
  }

  private async validateCounterparty(counterparty: string, trade: ITrade): Promise<string> {
    const [member] = await this.memberClient.find({ staticId: trade[counterparty] })
    if (!member) {
      this.logger.error(ErrorCode.DatabaseInvalidData, ErrorName.InvalidTradeData, 'Invalid counterparty', {
        action: 'validateCounterparty',
        id: trade._id,
        counterparty
      })

      throw new DataAccessException(
        DATA_ACCESS_ERROR.INVALID_DATA,
        `${counterparty} '${trade[counterparty]}' not found`
      )
    }
    return member.staticId
  }

  private appendDefaultFilter(filter: any): any {
    return {
      ...filter,
      deletedAt: null
    }
  }
}
