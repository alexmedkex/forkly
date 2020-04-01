import { ErrorCode } from '@komgo/error-utilities'
import { getLogger } from '@komgo/logging'
import { injectable, inject } from 'inversify'

import { DatabaseConnectionException, ContentNotFoundException } from '../../exceptions'
import { ErrorNames } from '../../exceptions/utils'
import { TYPES } from '../../inversify/types'
import { IRegistryEventManagerDAO } from '../dao/IRegistryEventManagerDAO'

import { IRegistryEventProcessedDataAgent } from './IRegistryEventProcessedDataAgent'

@injectable()
export class RegistryEventProcessedDataAgent implements IRegistryEventProcessedDataAgent {
  eventManagerDAO: IRegistryEventManagerDAO
  private logger = getLogger('EventsProcessor')

  constructor(@inject(TYPES.RegistryEventManagerDAO) eventDao) {
    this.eventManagerDAO = eventDao
  }

  async getLastEventProcessed(): Promise<any> {
    let event
    try {
      event = this.eventManagerDAO.getLastEventProcessed()
      return event
    } catch (error) {
      this.logger.error(
        ErrorCode.ConnectionDatabase,
        ErrorNames.GetLastEventProcessedFailed,
        error.message,
        new Error().stack
      )
      throw new DatabaseConnectionException('Failed to connect to database.')
    }
  }

  async createOrUpdate(blockNumber: number, transactionIndex: number, logIndex: number): Promise<any> {
    try {
      await this.eventManagerDAO.createOrUpdate(blockNumber, transactionIndex, logIndex)
    } catch (error) {
      this.logger.error(
        ErrorCode.ConnectionDatabase,
        ErrorNames.RegistryEventProcessedDataAgentCreateOrUpdateFailed,
        error.message,
        { blockNumber, transactionIndex, logIndex }
      )
      throw new DatabaseConnectionException('Failed to update database with new event.')
    }
  }
}
