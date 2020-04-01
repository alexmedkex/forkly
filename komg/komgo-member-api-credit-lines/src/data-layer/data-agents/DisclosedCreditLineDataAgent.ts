import { ErrorCode } from '@komgo/error-utilities'
import { getLogger } from '@komgo/logging'
import { injectable } from 'inversify'

import { ErrorName } from '../../utils/Constants'
import { DataAccessException, DATA_ACCESS_ERROR } from '../exceptions/DataAccessException'
import { IDisclosedCreditLine } from '../models/IDisclosedCreditLine'
import { IDisclosedCreditLineSummary } from '../models/IDisclosedCreditLineSummary'
import { DisclosedCreditLineRepo } from '../mongodb/DisclosedCreditLineRepo'
import { mongoObjectDeserialization } from '../utils/utils'

import { IDisclosedCreditLineDataAgent } from './IDisclosedCreditLineDataAgent'

@injectable()
export default class DisclosedCreditLineDataAgent implements IDisclosedCreditLineDataAgent {
  private readonly logger = getLogger('DisclosedCreditLineDataAgent')

  async create(disclosedCreditLine: IDisclosedCreditLine): Promise<string> {
    try {
      const { staticId } = await DisclosedCreditLineRepo.create(disclosedCreditLine)
      return staticId
    } catch (err) {
      this.handleError(err)
    }
  }

  async get(staticId: string): Promise<IDisclosedCreditLine> {
    const disclosedCreditLine = await this.getByStaticId(staticId)
    return mongoObjectDeserialization<IDisclosedCreditLine>(disclosedCreditLine)
  }

  async findOne(query: object, projection?: object, options?: object): Promise<IDisclosedCreditLine> {
    try {
      const filter = this.appendDefaultFilter(query)
      const disclosedCreditLine = await DisclosedCreditLineRepo.findOne(filter, projection, options)

      if (!disclosedCreditLine) {
        return null
      }

      return mongoObjectDeserialization<IDisclosedCreditLine>(disclosedCreditLine)
    } catch (err) {
      this.handleError(err)
    }
  }

  async find(query: object, projection?: object, options?: object): Promise<IDisclosedCreditLine[]> {
    try {
      const filter = this.appendDefaultFilter(query)
      const disclosedCreditLines = await DisclosedCreditLineRepo.find(filter, projection, options)

      if (!disclosedCreditLines || !disclosedCreditLines.length) {
        return []
      }

      return disclosedCreditLines.map(x => mongoObjectDeserialization<IDisclosedCreditLine>(x))
    } catch (err) {
      this.handleError(err)
    }
  }

  async count(query?: object): Promise<number> {
    try {
      return DisclosedCreditLineRepo.countDocuments(this.appendDefaultFilter(query))
    } catch (err) {
      this.handleError(err)
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const existingDisclosedCreditLine = await this.getByStaticId(id)

      existingDisclosedCreditLine.set({
        deletedAt: Date.now()
      })

      await existingDisclosedCreditLine.save()
      return undefined
    } catch (err) {
      this.handleError(err)
    }
  }

  async update(disclosedCreditLine: IDisclosedCreditLine): Promise<IDisclosedCreditLine> {
    const existingDisclosedCreditLine = await this.getByStaticId(disclosedCreditLine.staticId)
    try {
      const { staticId, createdAt, updatedAt, ...data } = disclosedCreditLine
      existingDisclosedCreditLine.set({
        ...data,
        updatedAt: Date.now()
      })

      await existingDisclosedCreditLine.save()
      return mongoObjectDeserialization<IDisclosedCreditLine>(existingDisclosedCreditLine)
    } catch (err) {
      this.handleError(err)
    }
  }

  async disclosedSummary(context, filter = {}): Promise<IDisclosedCreditLineSummary[]> {
    try {
      const aggregateResult = await DisclosedCreditLineRepo.aggregate([
        { $match: { context, ...filter } },
        {
          $group: {
            _id: '$counterpartyStaticId',
            availabilityCount: { $sum: { $cond: ['$availability', 1, 0] } },
            appetiteCount: { $sum: { $cond: ['$appetite', 1, 0] } },
            lowestFee: { $min: '$data.fee' }
          }
        },
        {
          $project: {
            counterpartyStaticId: '$_id',
            appetiteCount: 1,
            availabilityCount: 1,
            lowestFee: 1
          }
        }
      ])
      return aggregateResult.map((summary: any) => mongoObjectDeserialization(summary))
    } catch (err) {
      this.handleError(err)
    }
  }

  private handleError(err) {
    if (err instanceof DataAccessException) {
      throw err
    }

    const errors = err && err.errors ? err.errors : null

    if (err.name === 'ValidationError') {
      this.logger.error(ErrorCode.DatabaseInvalidData, ErrorName.DisclosedCreditLineInvalidData, {
        err: err.message,
        errorName: err.name
      })

      throw new DataAccessException(DATA_ACCESS_ERROR.INVALID_DATA, err.message, errors)
    }

    this.logger.error(ErrorCode.UnexpectedError, ErrorName.UnexpectedError, {
      err: err.message,
      errorName: err && err.name ? err.name : null
    })

    throw new DataAccessException(DATA_ACCESS_ERROR.GENERAL_ERROR, err.message, errors)
  }

  private async getByStaticId(staticId: string): Promise<any> {
    let disclosedCreditLine = null
    try {
      disclosedCreditLine = await DisclosedCreditLineRepo.findOne(this.appendDefaultFilter({ staticId }))
    } catch (err) {
      this.handleError(err)
    }

    if (!disclosedCreditLine) {
      this.logger.error(ErrorCode.DatabaseMissingData, ErrorName.MissingDisclosedCreditLineDataForStaticId, {
        staticId
      })
      throw new DataAccessException(
        DATA_ACCESS_ERROR.NOT_FOUND,
        ErrorName.MissingDisclosedCreditLineDataForStaticId,
        null
      )
    }

    return disclosedCreditLine
  }

  private appendDefaultFilter(filter: any): any {
    return {
      ...filter,
      deletedAt: null
    }
  }
}
