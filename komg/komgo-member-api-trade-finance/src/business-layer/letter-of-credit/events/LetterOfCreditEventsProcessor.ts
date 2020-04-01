import { inject, injectable } from 'inversify'
import { TYPES } from '../../../inversify/types'
import { getLogger } from '@komgo/logging'
import { IEventsProcessor } from '../../common/IEventsProcessor'
import { ILetterOfCreditEventService } from '../services/ILetterOfCreditEventService'
import { IEvent } from '../../common/IEvent'
import { LETTER_OF_CREDIT_EVENTS } from './LetterOfCreditEvents'
import { validSmartContracts } from '../../blockchain/contracts/ContractLibrary'
import * as _ from 'lodash'
import { getEventsForContract, decodeReceivedEvent } from '../../common/eventUtils'
import { ErrorCode } from '@komgo/error-utilities'
import { ErrorNames } from '../../../exceptions/utils'
import { ILetterOfCreditDataAgent } from '../../../data-layer/data-agents/letter-of-credit/ILetterOfCreditDataAgent'

const web3Utils = require('web3-utils')

@injectable()
export class LetterOfCreditEventsProcessor implements IEventsProcessor {
  private logger = getLogger('LetterOfCreditEventsProcessor')
  private dataAgent: ILetterOfCreditDataAgent
  private eventServices = {}
  private eventsMapping: {}
  private ContractTopicName = web3Utils.soliditySha3('LetterOfCredit')

  constructor(
    @inject(TYPES.LetterOfCreditDataAgent) agent: ILetterOfCreditDataAgent,
    @inject(TYPES.LetterOfCreditCreatedService) letterOfCreditCreatedService: ILetterOfCreditEventService,
    @inject(TYPES.LetterOfCreditNonceIncrementedService)
    letterOfCreditNonceIncrementedService: ILetterOfCreditEventService,
    @inject(TYPES.LetterOfCreditTransitionService) letterOfCreditTransitionService: ILetterOfCreditEventService
  ) {
    this.dataAgent = agent
    this.eventServices[LETTER_OF_CREDIT_EVENTS.LetterOfCreditCreated] = letterOfCreditCreatedService
    this.eventServices[LETTER_OF_CREDIT_EVENTS.NonceIncremented] = letterOfCreditNonceIncrementedService
    this.eventServices[LETTER_OF_CREDIT_EVENTS.TransitionWithData] = letterOfCreditTransitionService
    this.eventServices[LETTER_OF_CREDIT_EVENTS.Transition] = letterOfCreditTransitionService
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
    const letterOfCredit = await this.dataAgent.getByContractAddress(contractAddress)

    if (eventName !== LETTER_OF_CREDIT_EVENTS.LetterOfCreditCreated && !letterOfCredit) {
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

    const eventService: ILetterOfCreditEventService = this.eventServices[eventName]

    if (!eventService) {
      this.logger.error(
        ErrorCode.BlockchainEventValidation,
        ErrorNames.LCEventServiceNotFound,
        'Could not find a service for event',
        { eventName, transactionHash }
      )
      return
    }
    await eventService.doEvent(eventDecoded, event)
  }

  private getEventsToProcess() {
    const contractList = _.find(validSmartContracts, c => c.name === 'LetterOfCredit')

    return getEventsForContract(contractList, this.ContractTopicName)
  }
}
