import { getLogger } from '@komgo/logging'
import { inject, injectable, multiInject } from 'inversify'

import { ILCCacheDataAgent } from '../../../../data-layer/data-agents'
import { ILC } from '../../../../data-layer/models/ILC'
import { TYPES } from '../../../../inversify/types'
import getLCMetaData from '../../../util/getLCMetaData'
import { ILCEventService } from '../ILCEventService'
import { LC_STATE } from '../LCStates'
import { ILCTransitionEventProcessor } from './ILCTransitionEventProcessor'
import { getActionPerformer } from './getActionPerformer'
import { ErrorCode } from '@komgo/error-utilities'
import { ErrorNames } from '../../../../exceptions/utils'

const web3Utils = require('web3-utils')

@injectable()
export class LCTransitionProcessor implements ILCEventService {
  LCTransitionProcessor
  private logger = getLogger('LCTransitionProcessor')
  private readonly processors: Map<string, ILCTransitionEventProcessor> = new Map<string, ILCTransitionEventProcessor>()

  constructor(
    @inject(TYPES.LCCacheDataAgent) private readonly lcCacheDataAgent: ILCCacheDataAgent,
    @multiInject(TYPES.LCStateTransitionProcessor) processors: ILCTransitionEventProcessor[]
  ) {
    this.logger.info('Registering %d state transition processors', processors.length)
    processors.forEach(p => this.addProcessor(p))
  }

  async doEvent(lc: ILC, event: any, rawEvent: any): Promise<boolean> {
    const { stateId, blockNumber, address } = event
    const state: LC_STATE = web3Utils.hexToString(stateId)

    const performerId = getActionPerformer(lc, state)

    this.updateLCStatus(lc, state)

    const processor: ILCTransitionEventProcessor = this.processors[state]

    if (!processor) {
      this.logger.warn(
        ErrorCode.ValidationInvalidOperation,
        ErrorNames.ProcessorForStateTransitionNotFound,
        `LCTransitionProcessor: no processor for state transition: ${state}`,
        {
          ...getLCMetaData(lc),
          state
        }
      )

      return Promise.resolve(false)
    }

    lc.status = state
    return processor.processStateTransition(lc, {
      stateId: state,
      blockNumber,
      performerId
    })
  }

  private updateLCStatus(lc, state: LC_STATE) {
    return this.lcCacheDataAgent.updateStatus(lc._id, state, getActionPerformer(lc, state))
  }

  private addProcessor(processor: ILCTransitionEventProcessor): void {
    this.processors[processor.state] = processor
    this.logger.info('Registered LC state transition processor for state: %s', processor.state)
  }
}
