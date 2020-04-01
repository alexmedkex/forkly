import { inject, injectable } from 'inversify'
import { TYPES } from '../../../inversify/types'
import { getLogger } from '@komgo/logging'
import { IEventsProcessor } from '../../common/IEventsProcessor'
import { ILCCacheDataAgent } from '../../../data-layer/data-agents'
import { ILCEventService } from './ILCEventService'
import { IEvent } from '../../common/IEvent'
import { LC_EVENTS } from './LCEvents'
import { validSmartContracts } from '../../blockchain/contracts/ContractLibrary'
import * as _ from 'lodash'
import { getEventsForContract, decodeReceivedEvent } from '../../common/eventUtils'
import { ErrorCode } from '@komgo/error-utilities'
import { ErrorNames } from '../../../exceptions/utils'

const web3Utils = require('web3-utils')

@injectable()
export class LCEventsProcessor implements IEventsProcessor {
  private logger = getLogger('LCEventsProcessor')
  private cacheDataAgent: ILCCacheDataAgent
  private eventServices = {}
  private eventsMapping: {}
  private ContractTopicName = web3Utils.soliditySha3('LC')

  constructor(
    @inject(TYPES.LCCacheDataAgent) cache: ILCCacheDataAgent | any,
    @inject(TYPES.LCCreatedService) lcCreatedService: ILCEventService | any,
    @inject(TYPES.LCStateTransitionService) lCTransitionProcessor: ILCEventService | any,
    @inject(TYPES.LCDataUpdateEventService) lCDataUpdatedEvent: ILCEventService | any,
    @inject(TYPES.NonceIncrementedService) nonceIncrementedService: ILCEventService
  ) {
    this.cacheDataAgent = cache
    this.eventServices[LC_EVENTS.LCCreated] = lcCreatedService
    this.eventServices[LC_EVENTS.Transition] = lCTransitionProcessor
    this.eventServices[LC_EVENTS.DataUpdated] = lCDataUpdatedEvent
    this.eventServices[LC_EVENTS.NonceIncremented] = nonceIncrementedService
  }

  getEventMappings() {
    this.eventsMapping = this.getEventsToProcess()
    return this.eventsMapping
  }

  async processEvent(event: IEvent): Promise<any> {
    const transactionHash = event.transactionHash
    const contractAddress = event.address
    const eventDecoded = decodeReceivedEvent(this.eventsMapping, event, this.ContractTopicName) as any

    if (!eventDecoded || !eventDecoded.name) {
      this.logger.error(
        ErrorCode.BlockchainEventValidation,
        ErrorNames.LCEventDecodingFailed,
        `Could not decode event emitted from contract`,
        {
          event,
          contract: contractAddress,
          transactionHash
        }
      )
      return
    }
    const eventName = eventDecoded.name
    const lc = await this.cacheDataAgent.getLC({ contractAddress })

    if (eventName !== LC_EVENTS.LCCreated && !lc) {
      this.logger.warn(
        ErrorCode.ValidationInternalAMQP,
        ErrorNames.EventAddressNotFound,
        `Consumed event address not found in internal cache, skipping...`,
        {
          contract: contractAddress,
          eventName,
          transactionHash
        }
      )
      return
    }
    const eventService: ILCEventService = this.eventServices[eventName]
    if (!eventService) {
      this.logger.error(
        ErrorCode.BlockchainEventValidation,
        ErrorNames.LCEventServiceNotFound,
        'Could not find a service for event',
        { eventName, transactionHash }
      )
      return
    }
    await eventService.doEvent(lc, eventDecoded, event)
  }

  private getEventsToProcess() {
    const contractList = _.find(validSmartContracts, c => c.name === 'LC')

    return getEventsForContract(contractList, this.ContractTopicName)
  }
}
