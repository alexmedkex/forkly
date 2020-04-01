import { ErrorCode } from '@komgo/error-utilities'
import { getLogger } from '@komgo/logging'
import { DepositLoanType, Currency, DepositLoanPeriod } from '@komgo/types'
import { injectable } from 'inversify'

import { ErrorName } from '../../utils/Constants'
import { DataAccessException, DATA_ACCESS_ERROR } from '../exceptions/DataAccessException'
import { IDepositLoanRequestDocument } from '../models/IDepositLoanRequestDocument'
import { DepositLoanRequestRepo } from '../mongodb/DepositLoanRequestRepo'
import { mongoObjectDeserialization } from '../utils/utils'

import { IDepositLoanRequestDataAgent } from './IDepositLoanRequestDataAgent'

@injectable()
export default class DepositLoanRequestDataAgent implements IDepositLoanRequestDataAgent {
  private readonly logger = getLogger('RequestDepositLoanInformationDataAgent')

  async create(depositLoanRequest: IDepositLoanRequestDocument): Promise<string> {
    try {
      const { staticId } = await DepositLoanRequestRepo.create(depositLoanRequest)
      return staticId
    } catch (err) {
      this.handleError(err)
    }
  }

  async update(depositLoanRequest: IDepositLoanRequestDocument): Promise<IDepositLoanRequestDocument> {
    try {
      const existingDepositLoanRequest = await this.getByStaticId(depositLoanRequest.staticId)
      const { staticId, createdAt, updatedAt, ...data } = depositLoanRequest

      const updateObject: any = {
        ...data,
        updatedAt: Date.now()
      }
      existingDepositLoanRequest.set(updateObject)
      await existingDepositLoanRequest.save()
      return mongoObjectDeserialization<IDepositLoanRequestDocument>(existingDepositLoanRequest)
    } catch (err) {
      this.handleError(err)
    }
  }

  async get(type: DepositLoanType, staticId: string): Promise<IDepositLoanRequestDocument> {
    const depositLoanRequest = await this.getByStaticId(staticId)

    if (depositLoanRequest.type !== type) {
      return null
    }
    return mongoObjectDeserialization<IDepositLoanRequestDocument>(depositLoanRequest)
  }

  async find(
    filter: object,
    projection: object = {},
    options = { skip: undefined, limit: undefined }
  ): Promise<IDepositLoanRequestDocument[]> {
    try {
      const query = this.appendDefaultFilter(filter)
      const depositLoanRequests = await DepositLoanRequestRepo.find(query, projection, options)

      if (!depositLoanRequests || !depositLoanRequests.length) {
        return []
      }

      return depositLoanRequests.map(x => mongoObjectDeserialization<IDepositLoanRequestDocument>(x))
    } catch (err) {
      this.handleError(err)
    }
  }

  async findOne(
    filter: object,
    projection: object = {},
    options = { skip: undefined, limit: undefined }
  ): Promise<IDepositLoanRequestDocument> {
    try {
      const query = this.appendDefaultFilter(filter)
      const depositLoanRequest = await DepositLoanRequestRepo.findOne(query, projection, options)

      if (!depositLoanRequest) {
        return null
      }

      return mongoObjectDeserialization<IDepositLoanRequestDocument>(depositLoanRequest)
    } catch (err) {
      this.handleError(err)
    }
  }

  async findForCompaniesAndType(
    type: DepositLoanType,
    companyStaticId: string,
    currency: Currency,
    period: DepositLoanPeriod,
    periodDuration: number,
    filter?: object
  ): Promise<IDepositLoanRequestDocument[]> {
    try {
      const query = this.appendDefaultFilter({
        type,
        companyStaticId,
        currency,
        period,
        periodDuration,
        ...filter
      })

      if (!companyStaticId) {
        // do not filter by this field if not passed
        delete query.companyStaticId
      }

      const depositLoanRequests = await DepositLoanRequestRepo.find(query).exec()

      if (!depositLoanRequests || !depositLoanRequests.length) {
        return []
      }

      return depositLoanRequests.map(x => mongoObjectDeserialization<IDepositLoanRequestDocument>(x))
    } catch (err) {
      this.handleError(err)
    }
  }

  async count(query: object): Promise<number> {
    try {
      return DepositLoanRequestRepo.countDocuments(this.appendDefaultFilter(query))
    } catch (err) {
      this.handleError(err)
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const existingDepositLoanRequest = await this.getByStaticId(id)

      existingDepositLoanRequest.set({
        deletedAt: Date.now()
      })

      await existingDepositLoanRequest.save()
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
    let depositLoanRequest = null
    try {
      depositLoanRequest = await DepositLoanRequestRepo.findOne(this.appendDefaultFilter({ staticId }))
    } catch (err) {
      this.handleError(err)
    }

    if (!depositLoanRequest) {
      this.logger.error(ErrorCode.DatabaseMissingData, ErrorName.MissingDepositLoanRequestDataForStaticId, {
        staticId
      })
      throw new DataAccessException(
        DATA_ACCESS_ERROR.NOT_FOUND,
        ErrorName.MissingDepositLoanRequestDataForStaticId,
        null
      )
    }

    return depositLoanRequest
  }

  private appendDefaultFilter(filter: any): any {
    return {
      ...filter,
      deletedAt: null
    }
  }
}
