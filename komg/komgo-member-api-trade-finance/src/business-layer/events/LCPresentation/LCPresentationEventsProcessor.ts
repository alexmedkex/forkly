import { inject, injectable } from 'inversify'
import { TYPES } from '../../../inversify/types'
import { getLogger } from '@komgo/logging'
import { IEventsProcessor } from '../../common/IEventsProcessor'
import { IEvent } from '../../common/IEvent'
import { LCPresentationCreatedProcessor } from './eventProcessors/LCPresentationCreatedProcessor'
import { LCPresentationTransitionProcessor } from './eventProcessors/LCPresentationTransitionProcessor'
import { validSmartContracts } from '../../blockchain/contracts/ContractLibrary'
import { getEventsForContract, decodeReceivedEvent } from '../../common/eventUtils'
import * as _ from 'lodash'
import { LCPresentationEventType } from './eventProcessors/eventTypes/LCPresentationEventType'
import { LCPresentationDataUpdatedProcessor } from './eventProcessors/LCPresentationDataUpdatedProcessor'
import { ErrorCode } from '@komgo/error-utilities'
import { ErrorNames } from '../../../exceptions/utils'
import { InvalidMessageException } from '../../../exceptions'

const web3Utils = require('web3-utils')

@injectable()
export class LCPresentationEventsProcessor implements IEventsProcessor {
  private logger = getLogger('LCPresentationEventsProcessor')
  private eventsMapping: {}
  private eventsProcessor = {}
  private ContractTopicName = web3Utils.soliditySha3('LCPresentation')
  private ContractName = 'LCPresentation'

  constructor(
    @inject(TYPES.LCPresentationCreatedProcessor)
    presentationCreatedProcessor: LCPresentationCreatedProcessor,
    @inject(TYPES.LCPresentationTransitionProcessor)
    presentationTransitionProcessor: LCPresentationTransitionProcessor,
    @inject(TYPES.LCPresentationDataUpdatedProcessor)
    presentationDataUpdatedProcessor: LCPresentationDataUpdatedProcessor
  ) {
    this.eventsProcessor[LCPresentationEventType.LCPresentationCreated] = presentationCreatedProcessor
    this.eventsProcessor[LCPresentationEventType.Transition] = presentationTransitionProcessor
    this.eventsProcessor[LCPresentationEventType.DataUpdated] = presentationDataUpdatedProcessor
  }

  getEventMappings() {
    this.eventsMapping = this.getEventsToProcess()
    return this.eventsMapping
  }

  async processEvent(event: IEvent): Promise<any> {
    this.logger.info('Processing event', { transaction: event.transactionHash, address: event.address })
    const transactionHash = event.transactionHash
    const contractAddress = event.address
    const eventDecoded = decodeReceivedEvent(this.eventsMapping, event, this.ContractTopicName) as any

    if (!eventDecoded || !eventDecoded.name) {
      this.logger.error(
        ErrorCode.ValidationInternalAMQP,
        ErrorNames.LCPresentationEventDecodeFailed,
        `Could not decode event emitted from contract`,
        {
          event,
          contract: contractAddress,
          transactionHash
        },
        new Error().stack
      )

      throw new InvalidMessageException('Could not decode event emitted from contract')
    }

    const processor = this.eventsProcessor[eventDecoded.name]
    if (!processor) {
      this.logger.warn(
        ErrorCode.ValidationInternalAMQP,
        ErrorNames.LCPresentationEventProcessorNotFound,
        `Could not find processor for event emitted from contract`,
        {
          event,
          eventName: eventDecoded.name,
          contract: contractAddress,
          transactionHash
        },
        new Error().stack
      )
      return
    }

    await processor.processEvent(eventDecoded, event)
  }

  private getEventsToProcess() {
    const contractList = _.find(validSmartContracts, c => c.name === this.ContractName)

    return getEventsForContract(contractList, this.ContractTopicName)
  }
}
