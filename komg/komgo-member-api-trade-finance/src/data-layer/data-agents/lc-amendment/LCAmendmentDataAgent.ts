import { injectable } from 'inversify'
import { getLogger } from '@komgo/logging'
import { LCAmendmentRepo } from '../../mongodb/LCAmendmentRepo'
import { ILCAmendment, AMENDMENT_BASE_SCHEMA, AMENDMENT_EXTENDED_SCHEMA } from '@komgo/types'
import * as Ajv from 'ajv'

import { ILCAmendmentDataAgent } from './ILCAmendmentDataAgent'
import { ErrorCode } from '@komgo/error-utilities'
import { ErrorNames } from '../../../exceptions/utils'
import { DatabaseConnectionException } from '../../../exceptions'

const notImplemented = 'Not implemented yet'
const invalidLcAmendment = 'Invalid LCAmendment'
@injectable()
export class LCAmendmentDataAgent implements ILCAmendmentDataAgent {
  private logger = getLogger('LCAmendmentDataAgent')
  private ajv = new Ajv({ allErrors: true }).addSchema(AMENDMENT_BASE_SCHEMA).addSchema(AMENDMENT_EXTENDED_SCHEMA)

  count(query?: object): Promise<number> {
    throw new Error(notImplemented)
  }

  async create(amendment: ILCAmendment): Promise<string> {
    let entity
    try {
      entity = await LCAmendmentRepo.create(amendment)
    } catch (error) {
      this.logger.error(
        ErrorCode.ConnectionDatabase,
        ErrorNames.LCAmendmentCreateDatabaseConnectionFailed,
        error.message,
        {
          reference: amendment.reference
        },
        new Error().stack
      )
      throw new DatabaseConnectionException('Failed to create LC amendment.')
    }
    return entity.staticId
  }

  async delete(staticId: string): Promise<void> {
    throw new Error(notImplemented)
  }

  find(query: object, projection?: object, options?: object): Promise<[]> {
    throw new Error(notImplemented)
  }

  async get(staticId: string): Promise<ILCAmendment> {
    try {
      return await LCAmendmentRepo.findOne({ staticId })
    } catch (error) {
      this.logger.error(
        ErrorCode.ConnectionDatabase,
        ErrorNames.LCAmendmentGetDatabaseConnectionFailed,
        error.message,
        {
          staticId
        },
        new Error().stack
      )
      throw new DatabaseConnectionException(`Failed to get the LCAmendment`)
    }
  }

  async getByAddress(contractAddress: string): Promise<ILCAmendment> {
    try {
      return await LCAmendmentRepo.findOne({ contractAddress })
    } catch (e) {
      const error = `failed to get the LCAmendment contractAddress=${contractAddress} ${e.message}`
      this.logger.error(ErrorCode.ConnectionDatabase, ErrorNames.LCAmendmentDataAgentGetByAddressFailed, {
        error,
        message: e.message
      })
      throw new DatabaseConnectionException(error)
    }
  }

  async update(conditions: any, amendment: ILCAmendment): Promise<void> {
    try {
      await LCAmendmentRepo.update(conditions, amendment, { upsert: true })
    } catch (error) {
      this.logger.error(
        ErrorCode.ConnectionDatabase,
        ErrorNames.LCAmendmentUpdateFailed,
        error.message,
        {
          conditions,
          reference: amendment.reference
        },
        new Error().stack
      )
      throw new DatabaseConnectionException('Failed to update LC Amendment')
    }
  }
}
