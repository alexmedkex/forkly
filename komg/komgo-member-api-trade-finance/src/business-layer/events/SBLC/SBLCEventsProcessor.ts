import * as _ from 'lodash'
import { injectable, inject } from 'inversify'

import { getLogger } from '@komgo/logging'

import { validSmartContracts } from '../../blockchain/contracts/ContractLibrary'
import { TYPES } from '../../../inversify/types'

import { ISBLCDataAgent } from '../../../data-layer/data-agents'
import { IEventsProcessor } from '../../common/IEventsProcessor'
import { IEvent } from '../../common/IEvent'
import { getEventsForContract, decodeReceivedEvent } from '../../common/eventUtils'
import { SBLC_EVENT_TYPES } from './SBLCEvents'
import { ISBLCEventService } from './ISBLCEventService'
import { ErrorCode } from '@komgo/error-utilities'
import { ErrorNames } from '../../../exceptions/utils'

const web3Utils = require('web3-utils')

@injectable()
export class SBLCEventsProcessor implements IEventsProcessor {
  private readonly logger = getLogger('SBLCEventsProcessor')
  private eventsMapping: {}
  private readonly eventsServices = {}
  private readonly ContractTopicName = web3Utils.soliditySha3('SBLC')

  constructor(
    @inject(TYPES.SBLCDataAgent) private readonly dataAgent: ISBLCDataAgent,
    @inject(TYPES.SBLCCreatedService) sblcCreatedService: ISBLCEventService,
    @inject(TYPES.SBLCNonceIncrementedService) sblcNonceIncrementedService: ISBLCEventService,
    @inject(TYPES.SBLCTransitionService) sblcTransitionService: ISBLCEventService,
    @inject(TYPES.SBLCDataUpdatedEventService) sblcDataUpdatedService: ISBLCEventService
  ) {
    this.eventsServices[SBLC_EVENT_TYPES.SBLCCreated] = sblcCreatedService
    this.eventsServices[SBLC_EVENT_TYPES.NonceIncremented] = sblcNonceIncrementedService
    this.eventsServices[SBLC_EVENT_TYPES.Transition] = sblcTransitionService
    this.eventsServices[SBLC_EVENT_TYPES.DataUpdated] = sblcDataUpdatedService
  }

  async processEvent(event: IEvent): Promise<void> {
    const transactionHash = event.transactionHash
    const contractAddress = event.address
    this.logger.info('processing event', {
      transactionHash,
      contractAddress
    })
    const eventDecoded = decodeReceivedEvent(this.eventsMapping, event, this.ContractTopicName)
    if (!eventDecoded || !eventDecoded.name) {
      this.logger.error(
        ErrorCode.ValidationInternalAMQP,
        ErrorNames.SBLCDecodeEventFailed,
        `Could not decode event emitted from contract`,
        {
          contractAddress,
          transactionHash
        },
        new Error().stack
      )
      return
    }
    const eventName = eventDecoded.name
    const sblc = await this.dataAgent.getByContractAddress(contractAddress)

    if (eventName !== SBLC_EVENT_TYPES.SBLCCreated && !sblc) {
      this.logger.error(
        ErrorCode.DatabaseMissingData,
        ErrorNames.SBLCEventAddressNotFound,
        `Consumed event address not found in internal cache, skipping...`,
        {
          contractAddress,
          eventName,
          transactionHash
        },
        new Error().stack
      )
      return
    }

    const eventService: ISBLCEventService = this.eventsServices[eventName]
    if (!eventService) {
      this.logger.warn(
        ErrorCode.ValidationInternalAMQP,
        ErrorNames.SBLCEventServiceNotFound,
        'Could not find a service for event',
        { eventName, transactionHash, contractAddress }
      )
      return
    }

    await eventService.doEvent(sblc, eventDecoded, event)
  }

  getEventMappings() {
    this.eventsMapping = this.getEventsToProcess()
    return this.eventsMapping
  }

  private getEventsToProcess() {
    const contractList = _.find(validSmartContracts, c => c.name === 'SBLC')

    return getEventsForContract(contractList, this.ContractTopicName)
  }
}
