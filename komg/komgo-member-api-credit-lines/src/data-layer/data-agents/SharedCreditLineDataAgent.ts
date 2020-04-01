import { ErrorCode } from '@komgo/error-utilities'
import { getLogger } from '@komgo/logging'
import { ISharedCreditLine, IInformationShared, IProductContext } from '@komgo/types'
import { injectable } from 'inversify'

import { ErrorName } from '../../utils/Constants'
import { DataAccessException, DATA_ACCESS_ERROR } from '../exceptions/DataAccessException'
import { SharedCreditLineRepo } from '../mongodb/SharedCreditLineRepo'
import { mongoObjectDeserialization } from '../utils/utils'

import { ISharedCreditLineDataAgent } from './ISharedCreditLineDataAgent'

@injectable()
export default class SharedCreditLineDataAgent implements ISharedCreditLineDataAgent {
  private readonly logger = getLogger('SharedCreditLineDataAgent')

  async create(sharedCreditLine: ISharedCreditLine<IInformationShared>): Promise<string> {
    try {
      const { staticId } = await SharedCreditLineRepo.create(sharedCreditLine)
      return staticId
    } catch (err) {
      this.handleError(err)
    }
  }

  async update(
    sharedCreditLine: ISharedCreditLine<IInformationShared>
  ): Promise<ISharedCreditLine<IInformationShared>> {
    const existingCreditLine = await this.getByStaticId(sharedCreditLine.staticId)
    try {
      const { staticId, ...data } = sharedCreditLine
      existingCreditLine.set({
        ...data,
        updatedAt: Date.now()
      })
      await existingCreditLine.save()
      return mongoObjectDeserialization<ISharedCreditLine<IInformationShared>>(existingCreditLine)
    } catch (err) {
      this.handleError(err)
    }
  }

  async get(staticId: string): Promise<ISharedCreditLine<IInformationShared>> {
    const sharedCreditLine = await this.getByStaticId(staticId)

    return mongoObjectDeserialization<ISharedCreditLine<IInformationShared>>(sharedCreditLine)
  }

  async find(
    filter: object,
    projection: object = {},
    options = { skip: undefined, limit: undefined }
  ): Promise<Array<ISharedCreditLine<IInformationShared>>> {
    try {
      const query = this.appendDefaultFilter(filter)
      const sharedCreditLines = await SharedCreditLineRepo.find(query, projection, options)

      if (!sharedCreditLines || !sharedCreditLines.length) {
        return []
      }

      return sharedCreditLines.map(x => mongoObjectDeserialization<ISharedCreditLine<IInformationShared>>(x))
    } catch (err) {
      this.handleError(err)
    }
  }

  async findOneByCreditLineAndCompanies(
    sharedWithStaticId: string,
    counterpartyStaticId: string,
    query?: object,
    projection?: object,
    options?: object
  ): Promise<ISharedCreditLine<IInformationShared>> {
    try {
      const filter = this.appendDefaultFilter({
        sharedWithStaticId,
        counterpartyStaticId,
        ...query
      })

      const creditLine = await SharedCreditLineRepo.findOne(filter, projection, options)

      if (!creditLine) {
        return null
      }

      return mongoObjectDeserialization<ISharedCreditLine<IInformationShared>>(creditLine)
    } catch (err) {
      this.handleError(err)
    }
  }

  async count(query: object): Promise<number> {
    try {
      return SharedCreditLineRepo.countDocuments(this.appendDefaultFilter(query))
    } catch (err) {
      this.handleError(err)
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await SharedCreditLineRepo.findOneAndUpdate(this.appendDefaultFilter({ staticId: id }), {
        $set: { deletedAt: Date.now() }
      })
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
    let sharedCreditLine = null
    try {
      sharedCreditLine = await SharedCreditLineRepo.findOne(this.appendDefaultFilter({ staticId }))
    } catch (err) {
      this.handleError(err)
    }

    if (!sharedCreditLine) {
      this.logger.error(ErrorCode.DatabaseMissingData, ErrorName.MissingSharedCreditLineDataForStaticId, {
        staticId
      })
      throw new DataAccessException(DATA_ACCESS_ERROR.NOT_FOUND, ErrorName.MissingCreditLineDataForStaticId, null)
    }

    return sharedCreditLine
  }

  private appendDefaultFilter(filter: any): any {
    return {
      ...filter,
      deletedAt: null
    }
  }
}
