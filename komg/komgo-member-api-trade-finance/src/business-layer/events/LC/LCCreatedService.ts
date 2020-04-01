import { ILCEventService } from './ILCEventService'
import { injectable, inject } from 'inversify'
import { getLogger } from '@komgo/logging'
import { TYPES } from '../../../inversify/types'
import { ILCCacheDataAgent } from '../../../data-layer/data-agents'
import { ILC } from '../../../data-layer/models/ILC'
import { LCRequestedProcessor } from './LCTransitionEvents/LCRequestedProcessor'
import { LC_STATE } from './LCStates'

const pako = require('pako')
const web3Utils = require('web3-utils')

@injectable()
export class LCCreatedService implements ILCEventService {
  private logger = getLogger('LCCreatedService')

  constructor(
    @inject(TYPES.LCRequestedProcessor) private readonly lcRequestedProcessor: LCRequestedProcessor | any,
    @inject(TYPES.LCCacheDataAgent) private readonly cacheDataAgent: ILCCacheDataAgent | any
  ) {}

  async doEvent(lc: ILC, decodedEvent: any, rawEvent: any) {
    this.logger.info('Processing LCCreated decodedEvent')
    const contractAddress = rawEvent.address
    const transactionHash = rawEvent.transactionHash
    const draftLCDocumentHash = decodedEvent.draftLCDocumentHash
    const commercialContractDocumentHash = decodedEvent.commercialContractDocumentHash
    try {
      this.logger.info('Parsing LCCreated event data')
      const data = pako.inflate(decodedEvent.data, { to: 'string' })
      const dataObject: ILC = JSON.parse(data)
      dataObject.contractAddress = web3Utils.toChecksumAddress(contractAddress)
      dataObject.transactionHash = transactionHash
      dataObject.status = LC_STATE.REQUESTED
      dataObject.commercialContractDocumentHash = commercialContractDocumentHash
      dataObject.draftLCDocumentHash = draftLCDocumentHash
      dataObject.nonce = 1

      this.logger.info(`About to update LC', with address=${contractAddress}}`, {
        LCAddress: contractAddress,
        transactionHash
      })
      const reference = dataObject.reference
      await this.cacheDataAgent.updateLcByReference(reference, dataObject)

      await this.processRequestedState(dataObject, rawEvent)
    } catch (error) {
      this.logger.info('Error processing LCCreated', {
        error: 'LCCreatedEventProcessingFailed',
        errorObject: error
      })
    }
  }

  processRequestedState(lc: ILC, rawEvent: any): any {
    return this.lcRequestedProcessor.processStateTransition(lc, {
      stateId: LC_STATE.REQUESTED,
      blockNumber: rawEvent.blockNumber,
      performerId: lc.applicantId
    })
  }
}
