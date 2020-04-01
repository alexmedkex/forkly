import { getLogger } from '@komgo/logging'
import { injectable } from 'inversify'

import { AutoWhitelist } from '../models/auto-whitelist'

import { StopBlockNumberAlreadySetError } from './errors'
import { logAndThrowMongoError } from './utils'

@injectable()
export class AutoWhitelistDataAgent {
  private readonly logger = getLogger('AutoWhitelistDataAgent')

  async getStartBlockNumber(): Promise<number> {
    try {
      const state = await AutoWhitelist.findOne({}).exec()
      return state ? state.startBlockNumber : 0
    } catch (error) {
      logAndThrowMongoError(
        this.logger,
        error,
        'Unable to perform Mongo action on AutoWhitelist model: getStartBlockNumber'
      )
    }
  }

  async getStopBlockNumber(): Promise<number | null> {
    try {
      const state = await AutoWhitelist.findOne({}).exec()
      return state ? state.stopBlockNumber : null
    } catch (error) {
      logAndThrowMongoError(
        this.logger,
        error,
        'Unable to perform Mongo action on AutoWhitelist model: getStopBlockNumber'
      )
    }
  }

  async setStartBlockNumber(startBlockNumber: number): Promise<void> {
    try {
      await AutoWhitelist.updateOne(
        {},
        {
          $set: { startBlockNumber }
        },
        { upsert: true }
      ).exec()
    } catch (error) {
      logAndThrowMongoError(
        this.logger,
        error,
        'Unable to perform Mongo action on AutoWhitelist model: setStartBlockNumber'
      )
    }
  }

  async setStopBlockNumber(stopBlockNumber: number): Promise<void> {
    const state = await AutoWhitelist.findOne({}).exec()
    if (state && state.stopBlockNumber) {
      throw new StopBlockNumberAlreadySetError({
        existingStopBlockNumber: state.stopBlockNumber,
        attemptedStopBlockNumber: stopBlockNumber
      })
    }

    try {
      await AutoWhitelist.updateOne(
        {},
        {
          $set: { stopBlockNumber }
        },
        { upsert: true }
      ).exec()
    } catch (error) {
      logAndThrowMongoError(
        this.logger,
        error,
        'Unable to perform Mongo action on AutoWhitelist model: setStopBlockNumber'
      )
    }
  }
}
