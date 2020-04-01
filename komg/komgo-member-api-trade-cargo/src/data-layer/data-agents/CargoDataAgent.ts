import { injectable } from 'inversify'
import { getLogger } from '@komgo/logging'
import { CargoRepo } from '../mongodb/CargoRepo'
import { ICargoDataAgent } from './ICargoDataAgent'
import { LOC_STATUS } from '../constants/LetterOfCreditStatus'
import { CRUD_ACTIONS } from '../../data-layer/constants/CRUDActions'
import { ENTITY_TYPES } from '../constants/EntityTypes'
import { LOGGER_MESSAGES } from '../constants/LoggerMessages'
import { DataAccessException, DATA_ACCESS_ERROR } from '../exceptions/DataAccessException'
import { ErrorCode } from '@komgo/error-utilities'
import { ErrorName } from '../../utils/Constants'
import { TradeSource, ICargo } from '@komgo/types'
import { toObject } from './utils/toObject'

@injectable()
export default class CargoDataAgent implements ICargoDataAgent {
  private readonly logger = getLogger('CargoDataAgent')

  async find(query: object, projection: object, options = { skip: undefined, limit: undefined }): Promise<ICargo[]> {
    const { skip, limit } = options
    return CargoRepo.find({ ...query, deletedAt: null }, projection, options)
      .skip(skip)
      .limit(limit)
      .lean()
  }

  async findOne(query: object, source: string) {
    const sources = Object.values(TradeSource)
    if (!sources.includes(source)) {
      this.logger.error(
        ErrorCode.DatabaseInvalidData,
        ErrorName.InvalidCargoSource,
        LOGGER_MESSAGES.INVALID_FIELD_VALUE,
        {
          action: CRUD_ACTIONS.FIND_ONE,
          entityType: ENTITY_TYPES.CARGO,
          name: 'source',
          value: source,
          validValues: `(${sources.join('|')})`
        }
      )
      throw new DataAccessException(DATA_ACCESS_ERROR.INVALID_DATA, `'source' has to be (${sources.join('|')})`)
    }

    return CargoRepo.findOne({
      ...query,
      source,
      deletedAt: null
    })
  }

  async count(query: object): Promise<number> {
    return CargoRepo.countDocuments({
      ...query,
      deletedAt: null
    })
  }

  async update(id: string, update: ICargo): Promise<ICargo> {
    // // silently ignore read only props because they are read only attributes
    const { source, _id, cargoId, sourceId, status, createdAt, deletedAt, updatedAt, ...data } = update

    this.validateSource(source, { id, cargoId, sourceId })

    const cargo = await this.get(id, source)
    if (!cargo) {
      this.logger.error(ErrorCode.DatabaseMissingData, ErrorName.CargoNotFound, LOGGER_MESSAGES.NOT_FOUND, {
        action: CRUD_ACTIONS.UPDATE,
        entityType: ENTITY_TYPES.CARGO,
        id
      })
      throw new DataAccessException(DATA_ACCESS_ERROR.NOT_FOUND, `Cargo ${id} not found`)
    }

    return toObject(
      await CargoRepo.findOneAndUpdate(
        { cargoId: id },
        {
          ...data
        },
        { new: true }
      ).exec()
    )
  }

  async create(cargo: ICargo): Promise<string> {
    const { source, sourceId, cargoId } = cargo
    const cargoKeyData = { source, sourceId, cargoId }

    this.validateSource(source, cargoKeyData)

    if (!cargo.cargoId) {
      this.logger.error(
        ErrorCode.DatabaseInvalidData,
        ErrorName.CargoRequiredConstraintFailed,
        'Required field constraint',
        {
          action: CRUD_ACTIONS.CREATE,
          entityType: ENTITY_TYPES.CARGO,
          name: 'cargoid'
        }
      )

      throw new DataAccessException(
        DATA_ACCESS_ERROR.INVALID_DATA,
        `'cargoid' is obligatory for source ${cargo.source}`
      )
    }

    const documentCount = await this.count(cargoKeyData)
    if (documentCount > 0) {
      this.logger.error(
        ErrorCode.DatabaseInvalidData,
        ErrorName.CargoRequiredConstraintFailed,
        LOGGER_MESSAGES.UNIQUE_CONSTRAINT,
        {
          action: CRUD_ACTIONS.CREATE,
          entityType: ENTITY_TYPES.CARGO,
          ...cargoKeyData
        }
      )

      throw new DataAccessException(
        DATA_ACCESS_ERROR.DUPLICATE_KEY,
        `source: ${source}, sourceId: ${sourceId}, cargoId: ${cargoId}`
      )
    }

    try {
      const entity = await CargoRepo.create(cargo)
      return entity.cargoId
    } catch (e) {
      this.logger.error(ErrorCode.DatabaseInvalidData, ErrorName.InvalidCargoData, e.message || e, {
        action: CRUD_ACTIONS.CREATE,
        entityType: ENTITY_TYPES.CARGO,
        ...cargoKeyData
      })
      throw e
    }
  }

  async delete(id: string, source: string): Promise<void> {
    this.validateSource(source, { id })

    const query = { cargoId: id, source, deletedAt: null }
    const result = await CargoRepo.updateOne(query, { deletedAt: Date.now() })
    if (!result.n) {
      this.logger.error(ErrorCode.DatabaseMissingData, ErrorName.CargoNotFound, LOGGER_MESSAGES.NOT_FOUND, {
        action: CRUD_ACTIONS.DELETE,
        entityType: ENTITY_TYPES.CARGO,
        id
      })
      throw new DataAccessException(DATA_ACCESS_ERROR.NOT_FOUND, `Cargo ${id} not found`)
    }
    return undefined
  }

  async get(id: string, source: string): Promise<ICargo> {
    const cargo = await this.findOne({ cargoId: id }, source)
    if (!cargo) {
      this.logger.error(ErrorCode.DatabaseMissingData, ErrorName.CargoNotFound, LOGGER_MESSAGES.NOT_FOUND, {
        action: CRUD_ACTIONS.FIND_ONE,
        entityType: ENTITY_TYPES.CARGO,
        id
      })
      throw new DataAccessException(DATA_ACCESS_ERROR.NOT_FOUND, `Cargo ${id} not found`)
    }
    return toObject(cargo)
  }

  private validateSource(source: string, data: any = {}) {
    const sources = Object.values(TradeSource)
    if (!sources.includes(source)) {
      this.logger.error(
        ErrorCode.DatabaseInvalidData,
        ErrorName.InvalidCargoSource,
        LOGGER_MESSAGES.INVALID_FIELD_VALUE,
        {
          action: CRUD_ACTIONS.DELETE,
          entityType: ENTITY_TYPES.CARGO,
          name: 'source',
          value: source,
          validValues: `(${sources.join('|')})`,
          ...data
        }
      )
      throw new DataAccessException(DATA_ACCESS_ERROR.INVALID_DATA, `'source' has to be (${sources.join('|')})`)
    }
  }
}
