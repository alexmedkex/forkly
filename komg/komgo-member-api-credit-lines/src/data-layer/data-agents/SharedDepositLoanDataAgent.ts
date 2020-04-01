import { ErrorCode } from '@komgo/error-utilities'
import { getLogger } from '@komgo/logging'
import { ISharedDepositLoan, Currency, DepositLoanPeriod } from '@komgo/types'
import { injectable } from 'inversify'

import { ErrorName } from '../../utils/Constants'
import { DataAccessException, DATA_ACCESS_ERROR } from '../exceptions/DataAccessException'
import { SharedDepositLoanRepo } from '../mongodb/SharedDepositLoanRepo'
import { mongoObjectDeserialization } from '../utils/utils'

import { ISharedDepositLoanDataAgent } from './ISharedDepositLoanDataAgent'

@injectable()
export default class SharedDepositLoanDataAgent implements ISharedDepositLoanDataAgent {
  private readonly logger = getLogger('DepositLoanDataAgent')

  async create(depositLoan: ISharedDepositLoan): Promise<string> {
    try {
      const { staticId } = await SharedDepositLoanRepo.create(depositLoan)
      return staticId
    } catch (err) {
      this.handleError(err)
    }
  }

  async update(depositLoan: ISharedDepositLoan): Promise<ISharedDepositLoan> {
    try {
      const { createdAt, updatedAt, ...update } = depositLoan

      await SharedDepositLoanRepo.updateOne(this.appendDefaultFilter({ staticId: depositLoan.staticId }), update, {
        upsert: false,
        setDefaultsOnInsert: false
      }).exec()
      const existingDepositLoan = await this.getByStaticId(depositLoan.staticId)
      return mongoObjectDeserialization<ISharedDepositLoan>(existingDepositLoan)
    } catch (err) {
      this.handleError(err)
    }
  }

  async get(staticId: string): Promise<ISharedDepositLoan> {
    const depositLoan = await this.getByStaticId(staticId)
    return mongoObjectDeserialization<ISharedDepositLoan>(depositLoan)
  }

  async find(
    filter: object,
    projection: object = {},
    options = { skip: undefined, limit: undefined }
  ): Promise<ISharedDepositLoan[]> {
    try {
      const query = this.appendDefaultFilter(filter)
      const sharedDepositLoans = await SharedDepositLoanRepo.find(query, projection, options)

      if (!sharedDepositLoans || !sharedDepositLoans.length) {
        return []
      }

      return sharedDepositLoans.map(x => mongoObjectDeserialization<ISharedDepositLoan>(x))
    } catch (err) {
      this.handleError(err)
    }
  }

  async findOne(
    filter: object,
    projection: object = {},
    options = { skip: undefined, limit: undefined }
  ): Promise<ISharedDepositLoan> {
    try {
      const query = this.appendDefaultFilter(filter)
      const sharedDepositLoan = await SharedDepositLoanRepo.findOne(query, projection, options)

      if (!sharedDepositLoan) {
        return null
      }

      return mongoObjectDeserialization<ISharedDepositLoan>(sharedDepositLoan)
    } catch (err) {
      this.handleError(err)
    }
  }

  async findOneByDepositLoanAndCompanies(depositLoanStaticId: string, companyStaticId: string) {
    try {
      const sharedDepositLoan = await SharedDepositLoanRepo.findOne({
        sharedWithStaticId: companyStaticId,
        depositLoanStaticId
      })

      if (!sharedDepositLoan) {
        return null
      }

      return mongoObjectDeserialization<ISharedDepositLoan>(sharedDepositLoan)
    } catch (err) {
      this.handleError(err)
    }
  }

  async count(query: object): Promise<number> {
    try {
      return SharedDepositLoanRepo.countDocuments(this.appendDefaultFilter(query))
    } catch (err) {
      this.handleError(err)
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const existingSharedDepositLoan = await this.getByStaticId(id)

      existingSharedDepositLoan.set({
        deletedAt: Date.now()
      })

      await existingSharedDepositLoan.save()
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
    let sharedDepositLoan = null
    try {
      sharedDepositLoan = await SharedDepositLoanRepo.findOne(this.appendDefaultFilter({ staticId }))
    } catch (err) {
      this.handleError(err)
    }

    if (!sharedDepositLoan) {
      this.logger.error(ErrorCode.DatabaseMissingData, ErrorName.MissingDepositLoanDataForStaticId, {
        staticId
      })
      throw new DataAccessException(DATA_ACCESS_ERROR.NOT_FOUND, ErrorName.MissingDepositLoanDataForStaticId, null)
    }

    return sharedDepositLoan
  }

  private appendDefaultFilter(filter: any): any {
    return {
      ...filter,
      deletedAt: null
    }
  }
}
