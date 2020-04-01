import { IEventsProcessor } from '../../common/IEventsProcessor'
import { IEvent } from '../../common/IEvent'
import { validSmartContracts } from '../../blockchain/contracts/ContractLibrary'
import { getEventsForContract, decodeReceivedEvent } from '../../common/eventUtils'
import { injectable, inject } from 'inversify'
import { TYPES } from '../../../inversify/types'
import { ILCAmendmentDataAgent } from '../../../data-layer/data-agents'
import { getLogger } from '@komgo/logging'
import { ILCAmendmentEventService } from './ILCAmendmentEventService'
import * as _ from 'lodash'
import { LC_AMENDMENT_EVENT_TYPES } from './LCAmendmentEvents'
import { ErrorCode } from '@komgo/error-utilities'
import { ErrorNames } from '../../../exceptions/utils'

const web3Utils = require('web3-utils')

@injectable()
export class LCAmendmentEventsProcessor implements IEventsProcessor {
  private logger = getLogger('LCAmendmentEventsProcessor')
  private eventsMapping: {}
  private eventsServices = {}
  private ContractTopicName = web3Utils.soliditySha3('LCAmendment')
  private lcAmendmentDataAgent: ILCAmendmentDataAgent

  constructor(
    @inject(TYPES.LCAmendmentDataAgent) dataAgent: ILCAmendmentDataAgent | any,
    @inject(TYPES.LCAmendmentCreatedService) amendmentCreatedService: ILCAmendmentEventService | any,
    @inject(TYPES.LCAmendmentTransitionService) amendmentTransitionService: ILCAmendmentEventService | any,
    @inject(TYPES.LCAmendmentDataUpdatedEventService) amendmentDataUpdatedService: ILCAmendmentEventService | any
  ) {
    this.lcAmendmentDataAgent = dataAgent
    this.eventsServices[LC_AMENDMENT_EVENT_TYPES.LCAmendmentCreated] = amendmentCreatedService
    this.eventsServices[LC_AMENDMENT_EVENT_TYPES.Transition] = amendmentTransitionService
    this.eventsServices[LC_AMENDMENT_EVENT_TYPES.DataUpdated] = amendmentDataUpdatedService
  }

  async processEvent(event: IEvent): Promise<any> {
    const transactionHash = event.transactionHash
    const contractAddress = event.address
    const eventDecoded = decodeReceivedEvent(this.eventsMapping, event, this.ContractTopicName) as any
    if (!eventDecoded || !eventDecoded.name) {
      this.logger.error(
        ErrorCode.ValidationExternalInboundAMQP,
        ErrorNames.LCAmendmentEventDecodeFailed,
        `Could not decode event emitted from contract`,
        {
          event,
          contract: contractAddress,
          transactionHash
        },
        new Error().stack
      )
      return
    }
    this.logger.info(`Processing event ${eventDecoded.name}, ${JSON.stringify(eventDecoded)}`)
    const eventName = eventDecoded.name
    const amendment = await this.lcAmendmentDataAgent.getByAddress(contractAddress)

    if (eventName !== LC_AMENDMENT_EVENT_TYPES.LCAmendmentCreated && !amendment) {
      this.logger.error(
        ErrorCode.DatabaseMissingData,
        ErrorNames.LCAmendmentEventAddressNotFound,
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

    const eventService: ILCAmendmentEventService = this.eventsServices[eventName]
    if (!eventService) {
      this.logger.warn(
        ErrorCode.ValidationInternalAMQP,
        ErrorNames.LCAmendmentEventServiceNotFound,
        'Could not find a service for event',
        { eventName, transactionHash, contractAddress }
      )
      return
    }

    await eventService.doEvent(amendment, eventDecoded, event)
  }

  getEventMappings() {
    this.eventsMapping = this.getEventsToProcess()
    return this.eventsMapping
  }

  private getEventsToProcess() {
    const contractList = _.find(validSmartContracts, c => c.name === 'LCAmendment')
    return getEventsForContract(contractList, this.ContractTopicName)
  }
}
