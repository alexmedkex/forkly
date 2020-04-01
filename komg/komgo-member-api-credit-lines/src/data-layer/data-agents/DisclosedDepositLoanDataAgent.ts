import { ErrorCode } from '@komgo/error-utilities'
import { getLogger } from '@komgo/logging'
import { IDisclosedDepositLoan, DepositLoanType, IDisclosedDepositLoanSummary } from '@komgo/types'
import { injectable } from 'inversify'

import { ErrorName } from '../../utils/Constants'
import { DataAccessException, DATA_ACCESS_ERROR } from '../exceptions/DataAccessException'
import { DisclosedDepositLoanRepo } from '../mongodb/DisclosedDepositLoanRepo'
import { mongoObjectDeserialization } from '../utils/utils'

import { IDisclosedDepositLoanDataAgent } from './IDisclosedDepositLoanDataAgent'

@injectable()
export default class DisclosedDepositLoanDataAgent implements IDisclosedDepositLoanDataAgent {
  private readonly logger = getLogger('DepositLoanDataAgent')

  async create(depositLoan: IDisclosedDepositLoan): Promise<string> {
    try {
      const { staticId } = await DisclosedDepositLoanRepo.create(depositLoan)
      return staticId
    } catch (err) {
      this.handleError(err)
    }
  }

  async update(depositLoan: IDisclosedDepositLoan): Promise<IDisclosedDepositLoan> {
    try {
      const { createdAt, updatedAt, ...update } = depositLoan

      let toBeUpdate: any = {
        $set: update
      }

      if (update.appetite === null || update.appetite === undefined) {
        toBeUpdate = this.initUnset(toBeUpdate)
        toBeUpdate.$unset.appetite = 1
      }

      if (update.pricing === null || update.pricing === undefined) {
        toBeUpdate = this.initUnset(toBeUpdate)
        toBeUpdate.$unset!.pricing = 1
      }

      await DisclosedDepositLoanRepo.updateOne(
        this.appendDefaultFilter({ staticId: depositLoan.staticId }),
        toBeUpdate,
        {
          upsert: false,
          setDefaultsOnInsert: true,
          omitUndefined: true
        }
      ).exec()
      const existingDepositLoan = await this.getByStaticId(depositLoan.staticId)
      return mongoObjectDeserialization<IDisclosedDepositLoan>(existingDepositLoan)
    } catch (err) {
      this.handleError(err)
    }
  }

  async get(staticId: string): Promise<IDisclosedDepositLoan> {
    const depositLoan = await this.getByStaticId(staticId)
    return mongoObjectDeserialization<IDisclosedDepositLoan>(depositLoan)
  }

  async find(
    type: DepositLoanType,
    filter: object,
    projection: object = {},
    options = { skip: undefined, limit: undefined }
  ): Promise<IDisclosedDepositLoan[]> {
    try {
      const query = this.appendDefaultFilter({ ...filter, type })
      const depositLoans = await DisclosedDepositLoanRepo.find(query, projection, options)

      if (!depositLoans || !depositLoans.length) {
        return []
      }

      return depositLoans.map(x => mongoObjectDeserialization<IDisclosedDepositLoan>(x))
    } catch (err) {
      this.handleError(err)
    }
  }

  async findOne(
    type: DepositLoanType,
    filter: object,
    projection: object = {},
    options = { skip: undefined, limit: undefined }
  ): Promise<IDisclosedDepositLoan> {
    try {
      const query = this.appendDefaultFilter({ ...filter, type })
      const depositLoan = await DisclosedDepositLoanRepo.findOne(query, projection, options)

      if (!depositLoan) {
        return null
      }

      return mongoObjectDeserialization<IDisclosedDepositLoan>(depositLoan)
    } catch (err) {
      this.handleError(err)
    }
  }

  async count(type: DepositLoanType, query: object): Promise<number> {
    try {
      return DisclosedDepositLoanRepo.countDocuments(
        this.appendDefaultFilter({
          ...query,
          type
        })
      )
    } catch (err) {
      this.handleError(err)
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const existingDepositLoan = await this.getByStaticId(id)

      existingDepositLoan.set({
        deletedAt: Date.now()
      })

      await existingDepositLoan.save()
      return undefined
    } catch (err) {
      this.handleError(err)
    }
  }

  async disclosedSummary(type: DepositLoanType, filter = {}): Promise<IDisclosedDepositLoanSummary[]> {
    try {
      const aggregateResult = await DisclosedDepositLoanRepo.aggregate([
        { $match: { type, deletedAt: null, ...filter } },
        {
          $group: {
            _id: {
              currency: '$currency',
              period: '$period',
              periodDuration: '$periodDuration'
            },
            appetiteCount: { $sum: { $cond: ['$appetite', 1, 0] } },
            lowestPricing: { $min: '$pricing' },
            lastUpdated: { $max: '$updatedAt' }
          }
        },
        {
          $project: {
            _id: 0,
            currency: '$_id.currency',
            period: '$_id.period',
            periodDuration: '$_id.periodDuration',
            lowestPricing: 1,
            lastUpdated: 1,
            appetiteCount: 1
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
      this.logger.error(ErrorCode.DatabaseInvalidData, ErrorName.DepositLoanInvalidData, {
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
    let depositLoan = null
    try {
      depositLoan = await DisclosedDepositLoanRepo.findOne(this.appendDefaultFilter({ staticId }))
    } catch (err) {
      this.handleError(err)
    }

    if (!depositLoan) {
      this.logger.error(ErrorCode.DatabaseMissingData, ErrorName.MissingDepositLoanDataForStaticId, {
        staticId
      })
      throw new DataAccessException(DATA_ACCESS_ERROR.NOT_FOUND, ErrorName.MissingDepositLoanDataForStaticId, null)
    }

    return depositLoan
  }

  private initUnset(obj) {
    if (!obj.$unset) {
      obj.$unset = {}
    }
    return obj
  }

  private appendDefaultFilter(filter: any): any {
    return {
      ...filter,
      deletedAt: null
    }
  }
}
