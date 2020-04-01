import { ErrorCode } from '@komgo/error-utilities'
import { getLogger } from '@komgo/logging'
import { ICreditLine, IRiskCoverData } from '@komgo/types'
import { injectable } from 'inversify'

import { ErrorName } from '../../utils/Constants'
import { DataAccessException, DATA_ACCESS_ERROR } from '../exceptions/DataAccessException'
import { CreditLineRepo } from '../mongodb/CreditLineRepo'
import { mongoObjectDeserialization } from '../utils/utils'

import { ICreditLineDataAgent } from './ICreditLineDataAgent'

@injectable()
export default class CreditLineDataAgent implements ICreditLineDataAgent {
  private readonly logger = getLogger('CreditLineDataAgent')

  async create(creditLine: ICreditLine): Promise<string> {
    try {
      if (creditLine.availabilityAmount !== null && creditLine.availabilityAmount !== undefined) {
        creditLine.availabilityAmountUpdatedAt = new Date()
      }
      const riskCoverData: IRiskCoverData = creditLine.data
      if (
        riskCoverData &&
        riskCoverData.availabilityReserved !== null &&
        riskCoverData.availabilityReserved !== undefined
      ) {
        riskCoverData.availabilityReservedUpdatedAt = new Date()
      }
      const { staticId } = await CreditLineRepo.create(creditLine)
      return staticId
    } catch (err) {
      this.handleError(err)
    }
  }

  async update(creditLine: ICreditLine): Promise<ICreditLine> {
    try {
      const existingCreditLine = await this.getByStaticId(creditLine.staticId)
      const { staticId, createdAt, updatedAt, ...data } = creditLine

      const updateObject: any = {
        ...data,
        updatedAt: Date.now()
      }

      if (data && data.availabilityAmount !== existingCreditLine.availabilityAmount) {
        updateObject.availabilityAmountUpdatedAt = new Date()
      }

      // Case1: Check if data doesn't exist and creditLine request contains data fields
      // Case2: Check if availabilityReserved from database is not the same as one from request. Data is nullable so it must be checked
      if (
        (!existingCreditLine.data &&
          creditLine.data &&
          (creditLine.data as IRiskCoverData).availabilityReserved !== null &&
          (creditLine.data as IRiskCoverData).availabilityReserved !== undefined) ||
        (creditLine.data &&
          existingCreditLine.data &&
          (creditLine.data as IRiskCoverData).availabilityReserved !== existingCreditLine.data.availabilityReserved)
      ) {
        updateObject.data.availabilityReservedUpdatedAt = new Date()
      }

      existingCreditLine.set(updateObject)
      await existingCreditLine.save()
      return mongoObjectDeserialization<ICreditLine>(existingCreditLine)
    } catch (err) {
      this.handleError(err)
    }
  }

  async get(staticId: string): Promise<ICreditLine> {
    const creditLine = await this.getByStaticId(staticId)
    return mongoObjectDeserialization<ICreditLine>(creditLine)
  }

  async find(
    filter: object,
    projection: object = {},
    options = { skip: undefined, limit: undefined }
  ): Promise<ICreditLine[]> {
    try {
      const query = this.appendDefaultFilter(filter)
      const creditLines = await CreditLineRepo.find(query, projection, options)

      if (!creditLines || !creditLines.length) {
        return []
      }

      return creditLines.map(x => mongoObjectDeserialization<ICreditLine>(x))
    } catch (err) {
      this.handleError(err)
    }
  }

  async findOne(
    filter: object,
    projection: object = {},
    options = { skip: undefined, limit: undefined }
  ): Promise<ICreditLine> {
    try {
      const query = this.appendDefaultFilter(filter)
      const creditLine = await CreditLineRepo.findOne(query, projection, options)

      if (!creditLine) {
        return null
      }

      return mongoObjectDeserialization<ICreditLine>(creditLine)
    } catch (err) {
      this.handleError(err)
    }
  }

  async count(query: object): Promise<number> {
    try {
      return CreditLineRepo.countDocuments(this.appendDefaultFilter(query))
    } catch (err) {
      this.handleError(err)
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const existingCreditLine = await this.getByStaticId(id)

      existingCreditLine.set({
        deletedAt: Date.now()
      })

      await existingCreditLine.save()
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
      this.logger.error(ErrorCode.DatabaseInvalidData, ErrorName.CreditLineInvalidData, {
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
    let creditLine = null
    try {
      creditLine = await CreditLineRepo.findOne(this.appendDefaultFilter({ staticId }))
    } catch (err) {
      this.handleError(err)
    }

    if (!creditLine) {
      this.logger.error(ErrorCode.DatabaseMissingData, ErrorName.MissingCreditLineDataForStaticId, {
        staticId
      })
      throw new DataAccessException(DATA_ACCESS_ERROR.NOT_FOUND, ErrorName.MissingCreditLineDataForStaticId, null)
    }

    return creditLine
  }

  private appendDefaultFilter(filter: any): any {
    return {
      ...filter,
      deletedAt: null
    }
  }
}
