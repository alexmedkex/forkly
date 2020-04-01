import { injectable } from 'inversify'
import { ILCCacheDataAgent } from './ILCCacheDataAgent'
import { ILC } from '../../models/ILC'
import { LC_STATE } from '../../../business-layer/events/LC/LCStates'
import { getLogger } from '@komgo/logging'
import { ErrorCode } from '@komgo/error-utilities'
import { ErrorNames } from '../../../exceptions/utils'
import { DatabaseConnectionException } from '../../../exceptions'
import { LCRepo } from '../../mongodb/LCRepo'

@injectable()
export class LCCacheDataAgent implements ILCCacheDataAgent {
  private logger = getLogger('LCCacheDataAgent')

  public async saveLC(lc: ILC): Promise<string> {
    if (!lc._id) {
      // creating new lc
      lc.stateHistory = [
        {
          toState: lc.status,
          performer: lc.applicantId,
          date: new Date()
        }
      ]
    }
    const result = await this.save(lc)
    return result._id.toString()
  }

  public async updateLcByReference(reference: string, lc: ILC) {
    const result = await LCRepo.findOneAndUpdate({ reference }, lc, { upsert: true })
    return result
  }

  public async updateField(id: string, field: keyof ILC, value: any) {
    let result
    try {
      result = await LCRepo.findByIdAndUpdate(id, { $set: { [field]: value } })
    } catch (error) {
      this.logger.error(
        ErrorCode.ConnectionDatabase,
        ErrorNames.LCCacheDataAgentUpdateFieldFailed,
        error.message,
        {
          id,
          field,
          value
        },
        new Error().stack
      )
      throw new DatabaseConnectionException('Failed to update LC field.')
    }
    return result
  }

  public async updateStatus(id: string, status: LC_STATE, companyId: string): Promise<ILC> {
    let result
    try {
      const lc = await LCRepo.findOne({ _id: id })

      lc.stateHistory.push({
        fromState: lc.status,
        toState: status,
        performer: companyId,
        date: new Date()
      })

      lc.status = status
      result = await this.save(lc)

      return result
    } catch (error) {
      this.logger.error(
        ErrorCode.ConnectionDatabase,
        ErrorNames.LCCacheDataAgentUpdateStatusFailed,
        {
          id,
          status,
          companyId
        },
        new Error().stack
      )
      throw new DatabaseConnectionException('Failed to update LC status.')
    }
  }

  public async getLC(attributes: object): Promise<ILC> {
    let result
    result = await LCRepo.findOne(attributes)
    return result
  }

  public async getLCs(query, projection, options): Promise<ILC[]> {
    let result: ILC[]
    try {
      result = await LCRepo.find(query, projection, options)
    } catch (error) {
      this.logger.error(
        ErrorCode.ConnectionDatabase,
        ErrorNames.FindLCFailed,
        error.message,
        {
          query,
          projection
        },
        new Error().stack
      )
      throw new DatabaseConnectionException(error.message)
    }
    return result
  }

  public async getNonce(address: string): Promise<number> {
    let lc: ILC
    try {
      lc = await LCRepo.findOne({ contractAddress: address })
    } catch (error) {
      this.logger.error(
        ErrorCode.ConnectionDatabase,
        ErrorNames.LCCacheDataAgentGetNonceFailed,
        {
          error: 'GetNonceFailed'
        },
        new Error().stack
      )
      throw new DatabaseConnectionException('Failed to get nonce')
    }
    return lc.nonce
  }

  public async count(query?: object): Promise<number> {
    return LCRepo.countDocuments({
      ...query
    })
  }

  private async save(lc: ILC) {
    let entity: ILC
    try {
      entity = !lc._id
        ? await LCRepo.create(lc)
        : await LCRepo.findOneAndUpdate({ _id: lc._id }, lc, { upsert: true, new: true })
    } catch (error) {
      this.logger.error(
        ErrorCode.ConnectionDatabase,
        ErrorNames.SaveLCDatabaseFailed,
        error.message,
        { lcId: lc._id },
        new Error().stack
      )
      throw new DatabaseConnectionException(`Failed to save LC`)
    }
    return entity
  }
}
