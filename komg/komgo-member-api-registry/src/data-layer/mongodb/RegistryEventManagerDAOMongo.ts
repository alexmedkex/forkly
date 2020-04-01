import { ErrorCode } from '@komgo/error-utilities'
import { getLogger } from '@komgo/logging'
import { injectable } from 'inversify'

import { ErrorNames } from '../../exceptions/utils'
import { IRegistryEventManagerDAO } from '../dao/IRegistryEventManagerDAO'

import { IRegistryEventProcessedDocument } from './IRegistryEventProcessedDocument'
import { EventProcessedRepo } from './RegistryEventProcessedRepository'

@injectable()
export class RegistryEventManagerDAOMongo implements IRegistryEventManagerDAO {
  private logger = getLogger('RegistryEventManagerDAOMongo')

  async clearAll(): Promise<any> {
    await EventProcessedRepo.deleteMany({})
  }

  async getLastEventProcessed(): Promise<any> {
    return EventProcessedRepo.findOne({})
  }

  async createOrUpdate(blockNumber: number, transactionIndex: number, logIndex: number) {
    const prevEvent = await EventProcessedRepo.findOneAndUpdate(
      {},
      {
        blockNumber,
        transactionIndex,
        logIndex
      }
    )

    if (!prevEvent) {
      this.logger.warn(
        ErrorCode.DatabaseMissingData,
        ErrorNames.PreviousEventProcessedNotFound,
        'Prev event processed not found, storing one.',
        new Error().stack
      )
      await this.saveEventProcessed(blockNumber, transactionIndex, logIndex)
    }
  }

  async saveEventProcessed(blockNumber: number, transactionIndex: number, logIndex: number) {
    const eventProcessed = Object.seal({
      blockNumber,
      transactionIndex,
      logIndex
    }) as IRegistryEventProcessedDocument
    await EventProcessedRepo.create(eventProcessed)
  }
}
