import { ErrorCode } from '@komgo/error-utilities'
import { getLogger } from '@komgo/logging'
import { IProductContext } from '@komgo/types'
import { injectable } from 'inversify'

import { ErrorName } from '../../utils/Constants'
import { DataAccessException, DATA_ACCESS_ERROR } from '../exceptions/DataAccessException'
import { ICreditLineRequestDocument } from '../models/ICreditLineRequestDocument'
import { CreditLineRequestRepo } from '../mongodb/CreditLineRequestRepo'
import { mongoObjectDeserialization } from '../utils/utils'

import { ICreditLineRequestDataAgent } from './ICreditLineRequestDataAgent'

@injectable()
export default class CreditLineRequestDataAgent implements ICreditLineRequestDataAgent {
  private readonly logger = getLogger('RequestInformationDataAgent')

  async create(creditLineRequest: ICreditLineRequestDocument): Promise<string> {
    try {
      const { staticId } = await CreditLineRequestRepo.create(creditLineRequest)
      return staticId
    } catch (err) {
      this.handleError(err)
    }
  }

  async update(creditLineRequest: ICreditLineRequestDocument): Promise<ICreditLineRequestDocument> {
    try {
      const existingCreditLineRequest = await this.getByStaticId(creditLineRequest.staticId)
      const { staticId, createdAt, updatedAt, ...data } = creditLineRequest

      const updateObject: any = {
        ...data,
        updatedAt: Date.now()
      }
      existingCreditLineRequest.set(updateObject)
      await existingCreditLineRequest.save()
      return mongoObjectDeserialization<ICreditLineRequestDocument>(existingCreditLineRequest)
    } catch (err) {
      this.handleError(err)
    }
  }

  async get(staticId: string): Promise<ICreditLineRequestDocument> {
    const creditLineRequest = await this.getByStaticId(staticId)
    return mongoObjectDeserialization<ICreditLineRequestDocument>(creditLineRequest)
  }

  async find(
    filter: object,
    projection: object = {},
    options = { skip: undefined, limit: undefined }
  ): Promise<ICreditLineRequestDocument[]> {
    try {
      const query = this.appendDefaultFilter(filter)
      const creditLineRequests = await CreditLineRequestRepo.find(query, projection, options)

      if (!creditLineRequests || !creditLineRequests.length) {
        return []
      }

      return creditLineRequests.map(x => mongoObjectDeserialization<ICreditLineRequestDocument>(x))
    } catch (err) {
      this.handleError(err)
    }
  }

  async findOne(
    filter: object,
    projection: object = {},
    options = { skip: undefined, limit: undefined }
  ): Promise<ICreditLineRequestDocument> {
    try {
      const query = this.appendDefaultFilter(filter)
      const creditLineRequest = await CreditLineRequestRepo.findOne(query, projection, options)

      if (!creditLineRequest) {
        return null
      }

      return mongoObjectDeserialization<ICreditLineRequestDocument>(creditLineRequest)
    } catch (err) {
      this.handleError(err)
    }
  }

  async findForCompaniesAndContext(
    context: IProductContext,
    companyStaticId: string,
    counterpartyStaticId: string,
    filter?: object
  ) {
    try {
      const query = this.appendDefaultFilter({
        context,
        companyStaticId,
        counterpartyStaticId,
        ...filter
      })

      if (!companyStaticId) {
        // do not filter by this field if not passed
        delete query.companyStaticId
      }

      const creditLineRequests = await CreditLineRequestRepo.find(query).exec()

      if (!creditLineRequests || !creditLineRequests.length) {
        return []
      }

      return creditLineRequests.map(x => mongoObjectDeserialization<ICreditLineRequestDocument>(x))
    } catch (err) {
      this.handleError(err)
    }
  }

  async count(query: object): Promise<number> {
    try {
      return CreditLineRequestRepo.countDocuments(this.appendDefaultFilter(query))
    } catch (err) {
      this.handleError(err)
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const existingCreditLineRequest = await this.getByStaticId(id)

      existingCreditLineRequest.set({
        deletedAt: Date.now()
      })

      await existingCreditLineRequest.save()
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
    let creditLineRequest = null
    try {
      creditLineRequest = await CreditLineRequestRepo.findOne(this.appendDefaultFilter({ staticId }))
    } catch (err) {
      this.handleError(err)
    }

    if (!creditLineRequest) {
      this.logger.error(ErrorCode.DatabaseMissingData, ErrorName.MissingCreditLineRequestForStaticId, {
        staticId
      })
      throw new DataAccessException(DATA_ACCESS_ERROR.NOT_FOUND, ErrorName.MissingCreditLineRequestForStaticId, null)
    }

    return creditLineRequest
  }

  private appendDefaultFilter(filter: any): any {
    return {
      ...filter,
      deletedAt: null
    }
  }
}
