import { injectable, inject } from 'inversify'

import { IStandbyLetterOfCredit } from '@komgo/types'
import { getLogger } from '@komgo/logging'

import { SBLCRepo } from '../../mongodb/sblc/SBLCRepo'

import { ISBLCDataAgent } from './ISBLCDataAgent'
import { ErrorCode } from '@komgo/error-utilities'
import { ErrorNames } from '../../../exceptions/utils'
import { DatabaseConnectionException } from '../../../exceptions'

@injectable()
export class SBLCDataAgent implements ISBLCDataAgent {
  private logger = getLogger('SBLCDataAgent')

  async save(sblc: IStandbyLetterOfCredit): Promise<string> {
    let entity: IStandbyLetterOfCredit
    try {
      entity = await SBLCRepo.create(sblc)
      return entity.staticId
    } catch (e) {
      const error = `Failed to save the SBLC ${e.message}`
      this.logger.error(ErrorCode.ConnectionDatabase, ErrorNames.SaveSBLCFailed, error, new Error().stack)
      throw new DatabaseConnectionException(error)
    }
  }

  async get(staticId: string): Promise<IStandbyLetterOfCredit> {
    try {
      return await SBLCRepo.findOne({ staticId })
    } catch (e) {
      const error = `Failed to get the SBLC ${staticId} ${e.message}`
      this.logger.error(
        ErrorCode.ConnectionDatabase,
        ErrorNames.GetSBLCFailed,
        error,
        {
          staticId
        },
        new Error().stack
      )
      throw new DatabaseConnectionException(error)
    }
  }

  async getByContractAddress(contractAddress: string): Promise<IStandbyLetterOfCredit> {
    try {
      return await SBLCRepo.findOne({ contractAddress })
    } catch (e) {
      const error = `Failed to get the SBLC ${contractAddress} ${e.message}`
      this.logger.error(
        ErrorCode.ConnectionDatabase,
        ErrorNames.SBLCGetByContractAddressFailed,
        error,
        {
          contractAddress
        },
        new Error().stack
      )
      throw new DatabaseConnectionException(error)
    }
  }

  async update(conditions: any, sblc: IStandbyLetterOfCredit): Promise<IStandbyLetterOfCredit> {
    let result: IStandbyLetterOfCredit
    try {
      result = await SBLCRepo.findOneAndUpdate(conditions, sblc, { upsert: true })
    } catch (e) {
      const error = `failed to update SBLC ${e.message}`
      this.logger.error(
        ErrorCode.ConnectionDatabase,
        ErrorNames.UpdateSBLCFailed,
        error,
        {
          conditions
        },
        new Error().stack
      )
      throw new DatabaseConnectionException(error)
    }
    return result
  }

  async getNonce(contractAddress: string): Promise<number> {
    let entity: IStandbyLetterOfCredit
    try {
      entity = await SBLCRepo.findOne({ contractAddress })
    } catch (e) {
      const error = `failed to update SBLC ${e.message}`
      this.logger.error(ErrorCode.ConnectionDatabase, ErrorNames.UpdateSBLCFailed, error, new Error().stack)
      throw new DatabaseConnectionException(error)
    }
    return entity.nonce
  }
  async find(
    query?: object,
    projection?: object,
    options = { skip: undefined, limit: undefined }
  ): Promise<IStandbyLetterOfCredit[]> {
    const { skip, limit } = options
    return SBLCRepo.find(query, projection, options)
      .skip(skip)
      .limit(limit)
      .lean()
  }
  async count(query: object): Promise<number> {
    return SBLCRepo.countDocuments(query)
  }
}
