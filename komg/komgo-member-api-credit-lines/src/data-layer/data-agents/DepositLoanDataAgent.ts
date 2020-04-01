import { ErrorCode } from '@komgo/error-utilities'
import { getLogger } from '@komgo/logging'
import { IDepositLoan } from '@komgo/types'
import { injectable } from 'inversify'

import { ErrorName } from '../../utils/Constants'
import { DataAccessException, DATA_ACCESS_ERROR } from '../exceptions/DataAccessException'
import { DepositLoanRepo } from '../mongodb/DepositLoanRepo'
import { mongoObjectDeserialization } from '../utils/utils'

import { IDepositLoanDataAgent } from './IDepositLoanDataAgent'

@injectable()
export default class DepositLoanDataAgent implements IDepositLoanDataAgent {
  private readonly logger = getLogger('DepositLoanDataAgent')

  async create(depositLoan: IDepositLoan): Promise<string> {
    try {
      const { staticId } = await DepositLoanRepo.create(depositLoan)
      return staticId
    } catch (err) {
      this.handleError(err)
    }
  }

  async update(depositLoan: IDepositLoan): Promise<IDepositLoan> {
    try {
      const existingDepositLoan = await this.getByStaticId(depositLoan.staticId)
      const { createdAt, updatedAt, ...update } = depositLoan

      update.pricingUpdatedAt =
        update && update.pricing !== existingDepositLoan.pricing
          ? new Date().toISOString()
          : existingDepositLoan.pricingUpdatedAt

      await DepositLoanRepo.updateOne(this.appendDefaultFilter({ staticId: depositLoan.staticId }), update, {
        upsert: false,
        setDefaultsOnInsert: true
      }).exec()

      const updatedDepositLoan = {
        ...existingDepositLoan,
        ...update
      }
      return mongoObjectDeserialization<IDepositLoan>(updatedDepositLoan)
    } catch (err) {
      this.handleError(err)
    }
  }

  async get(staticId: string): Promise<IDepositLoan> {
    const depositLoan = await this.getByStaticId(staticId)
    return mongoObjectDeserialization<IDepositLoan>(depositLoan)
  }

  async find(
    filter: object,
    projection: object = {},
    options = { skip: undefined, limit: undefined }
  ): Promise<IDepositLoan[]> {
    try {
      const query = this.appendDefaultFilter(filter)
      const depositLoans = await DepositLoanRepo.find(query, projection, options)

      if (!depositLoans || !depositLoans.length) {
        return []
      }

      return depositLoans.map(x => mongoObjectDeserialization<IDepositLoan>(x))
    } catch (err) {
      this.handleError(err)
    }
  }

  async findOne(
    filter: object,
    projection: object = {},
    options = { skip: undefined, limit: undefined }
  ): Promise<IDepositLoan> {
    try {
      const query = this.appendDefaultFilter(filter)
      const depositLoan = await DepositLoanRepo.findOne(query, projection, options)

      if (!depositLoan) {
        return null
      }

      return mongoObjectDeserialization<IDepositLoan>(depositLoan)
    } catch (err) {
      this.handleError(err)
    }
  }

  async count(query: object): Promise<number> {
    try {
      return DepositLoanRepo.countDocuments(this.appendDefaultFilter(query))
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
      depositLoan = await DepositLoanRepo.findOne(this.appendDefaultFilter({ staticId }))
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

  private appendDefaultFilter(filter: any): any {
    return {
      ...filter,
      deletedAt: null
    }
  }
}
