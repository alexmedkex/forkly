import { ErrorCode } from '@komgo/error-utilities'
import { getLogger } from '@komgo/logging'
import { inject, injectable } from 'inversify'

import { TYPES } from '../inversify/types'
import { ErrorName } from '../util/ErrorName'

import IService from './IService'
import PrivateAutoWhitelistService from './PrivateAutoWhitelistService'
import PublicAutoWhitelistService from './PublicAutoWhitelistService'

const sleep = ms => new Promise(res => setTimeout(res, ms))

@injectable()
export default class RunnerService implements IService {
  private readonly logger = getLogger('RunnerService')

  constructor(
    @inject(TYPES.BlockchainEventService) private readonly blockchainEventsService: IService,
    @inject(TYPES.PrivateAutoWhitelistService)
    private readonly privateAutoWhitelistService: PrivateAutoWhitelistService,
    @inject(TYPES.PublicAutoWhitelistService)
    private readonly publicAutoWhitelistService: PublicAutoWhitelistService
  ) {}

  async start() {
    let succeeded: boolean = false
    while (!succeeded) {
      try {
        await this.publicAutoWhitelistService.start()
        await this.privateAutoWhitelistService.start()
        succeeded = true
      } catch (error) {
        this.logger.error(
          ErrorCode.UnexpectedError,
          ErrorName.UnableToStartService,
          'Failed to start service. Retrying in 2 seconds...',
          {
            errorMessage: error.message
          }
        )
        await sleep(2000)
      }
    }
    this.blockchainEventsService.start()
  }

  stop() {
    this.blockchainEventsService.stop()
  }
}
