import { injectable, inject } from 'inversify'
import { getLogger } from '@komgo/logging'
import { ErrorCode } from '@komgo/error-utilities'
import { ErrorNames } from '../../../exceptions/utils'
import { DatabaseConnectionException } from '../../../exceptions'
import { ILetterOfCreditDataAgent } from './ILetterOfCreditDataAgent'
import { ILetterOfCredit, IDataLetterOfCredit } from '@komgo/types'
import { LetterOfCreditRepo } from '../../mongodb/letter-of-credit/LetterOfCreditRepo'

@injectable()
export class LetterOfCreditDataAgent implements ILetterOfCreditDataAgent {
  private logger = getLogger('LetterOfCreditDataAgent')

  async save(letterOfCredit: ILetterOfCredit<IDataLetterOfCredit>): Promise<string> {
    try {
      const document = await LetterOfCreditRepo.create(letterOfCredit)
      return document ? document.toObject().staticId : null
    } catch (e) {
      const error = `Failed to save the letter of credit. ${e.message}`
      this.logger.error(ErrorCode.ConnectionDatabase, ErrorNames.SaveSBLCFailed, error, {
        stackTrace: new Error().stack
      })
      throw new DatabaseConnectionException(error)
    }
  }

  async get(staticId: string): Promise<ILetterOfCredit<IDataLetterOfCredit>> {
    try {
      const document = await LetterOfCreditRepo.findOne({ staticId })
      return document ? document.toObject() : null
    } catch (e) {
      const error = `Failed to get the letter of credit with staticId: ${staticId}. ${e.message}`
      this.logger.error(ErrorCode.ConnectionDatabase, ErrorNames.GetSBLCFailed, error, {
        staticId,
        stackTrace: new Error().stack
      })
      throw new DatabaseConnectionException(error)
    }
  }

  async getByContractAddress(contractAddress: string): Promise<ILetterOfCredit<IDataLetterOfCredit>> {
    try {
      const document = await LetterOfCreditRepo.findOne({ contractAddress })
      return document ? document.toObject() : null
    } catch (e) {
      const error = `Failed to get the letter of credit with contract address: ${contractAddress}. ${e.message}`
      this.logger.error(ErrorCode.ConnectionDatabase, ErrorNames.SBLCGetByContractAddressFailed, error, {
        contractAddress,
        stackTrace: new Error().stack
      })
      throw new DatabaseConnectionException(error)
    }
  }

  async getByTransactionHash(transactionHash: string): Promise<ILetterOfCredit<IDataLetterOfCredit>> {
    try {
      const document = await LetterOfCreditRepo.findOne({ transactionHash })
      return document ? document.toObject() : null
    } catch (e) {
      const error = `Failed to get the letter of credit with transaction hash: ${transactionHash}. ${e.message}`
      this.logger.error(ErrorCode.ConnectionDatabase, ErrorNames.SBLCGetByContractAddressFailed, error, {
        transactionHash,
        stackTrace: new Error().stack
      })
      throw new DatabaseConnectionException(error)
    }
  }

  async update(conditions: any, fields: any): Promise<ILetterOfCredit<IDataLetterOfCredit>> {
    try {
      const document = await LetterOfCreditRepo.findOneAndUpdate(conditions, fields, { upsert: true })
      return document ? document.toObject() : null
    } catch (e) {
      const error = `failed to update letter of credit. ${e.message}`
      this.logger.error(ErrorCode.ConnectionDatabase, ErrorNames.UpdateSBLCFailed, error, {
        conditions,
        stackTrace: new Error().stack
      })
      throw new DatabaseConnectionException(error)
    }
  }

  async getNonce(contractAddress: string): Promise<number> {
    try {
      const document = await LetterOfCreditRepo.findOne({ contractAddress })
      return document ? document.toObject().nonce : null
    } catch (e) {
      const error = `failed to update letter of credit. ${e.message}`
      this.logger.error(ErrorCode.ConnectionDatabase, ErrorNames.UpdateSBLCFailed, error, {
        stackTrace: new Error().stack
      })
      throw new DatabaseConnectionException(error)
    }
  }

  async find(
    query?: object,
    projection?: object,
    options = { skip: undefined, limit: undefined }
  ): Promise<Array<ILetterOfCredit<IDataLetterOfCredit>>> {
    const { skip, limit } = options
    return LetterOfCreditRepo.find(query, projection, options)
      .skip(skip)
      .limit(limit)
      .lean()
  }

  async count(query: object): Promise<number> {
    return LetterOfCreditRepo.countDocuments(query)
  }
}
