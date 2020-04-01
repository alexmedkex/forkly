import { injectable, inject, multiInject } from 'inversify'
import { ILCPresentationEventProcessor } from './ILCPresentationEventProcessor'
import { ILCPresentationTransitionEvent } from './eventTypes/ILCPresentationTransitionEvent'
import { IEvent } from '../../../common/IEvent'
import { TYPES } from '../../../../inversify/types'
import { ILCPresentationService } from '../../../lc-presentation/ILCPresentationService'
import { ILCCacheDataAgent } from '../../../../data-layer/data-agents'
import { getCurrentPresentationRole, getPerformer } from '../LCPresentationRole'
import { ILCPresentationTransitionStateProcessor } from './ILCPresentationTransitionStateProcessor'
import {
  LCPresentationContractStatus,
  getLCPresentationStatus,
  getContractStatusByHash
} from '../LCPresentationContractStatus'
import { getLogger } from '@komgo/logging'
import InvalidMessageException from '../../../../exceptions/InvalidMessageException'
import { ILCPresentation } from '../../../../data-layer/models/ILCPresentation'
import { LCPresentationStatus } from '@komgo/types'
import { CONFIG } from '../../../../inversify/config'
import { ErrorNames } from '../../../../exceptions/utils'
import { ErrorCode } from '@komgo/error-utilities'

@injectable()
export class LCPresentationTransitionProcessor implements ILCPresentationEventProcessor {
  private logger = getLogger('LCPresentationTransitionProcessor')

  constructor(
    @inject(TYPES.LCPresentationService) private readonly presentationService: ILCPresentationService,
    @inject(TYPES.LCCacheDataAgent) private readonly lcCacheDataAgent: ILCCacheDataAgent,
    @inject(CONFIG.CompanyStaticId) private readonly companyId: string,
    @multiInject(TYPES.LCPresentationTransitionStateProcessor)
    private readonly eventsProcessors: ILCPresentationTransitionStateProcessor[]
  ) {}

  async processEvent(eventData: ILCPresentationTransitionEvent, event: IEvent) {
    const contractStatus = getContractStatusByHash(eventData.stateId)
    eventData.stateIdDecoded = contractStatus
    const contractAddress = event.address

    let presentation = await this.presentationService.getLCPresentation({
      'contracts.contractAddress': contractAddress
    })
    if (!presentation) {
      this.processError(
        ErrorCode.DatabaseInvalidData,
        ErrorNames.ProcessingLCPresentationEventFailed,
        'LC presentation not found',
        contractAddress,
        true
      )
    }

    const lc = await this.lcCacheDataAgent.getLC({ reference: presentation.LCReference })
    if (!lc) {
      this.processError(
        ErrorCode.DatabaseInvalidData,
        ErrorNames.ProcessingLCPresentationEventFailed,
        'LC not found',
        presentation.LCReference,
        true
      )
    }

    const status = getLCPresentationStatus(contractStatus)
    const actionPerformer = getPerformer(presentation, contractStatus)

    if (!actionPerformer) {
      throw this.processError(
        ErrorCode.DatabaseInvalidData,
        ErrorNames.ProcessingLCPresentationEventFailed,
        'Unknown action performer'
      )
    }

    this.updateStatusData(presentation, status, actionPerformer.companyId)
    presentation.destinationState = null
    presentation = await this.presentationService.updatePresentation(presentation)

    const currentRole = getCurrentPresentationRole(presentation, this.companyId)

    const processor = this.getProcessorForState(eventData.stateIdDecoded as LCPresentationContractStatus)
    if (!processor) {
      this.logger.warn(
        ErrorCode.ValidationInvalidOperation,
        ErrorNames.LCPresentationStateProcessorNotFound,
        `Processor for state "${eventData.stateIdDecoded}" not found`
      )
      return
    }

    return processor.processEvent(presentation, event, currentRole, lc)
  }

  private getProcessorForState(contractState: LCPresentationContractStatus): ILCPresentationTransitionStateProcessor {
    return this.eventsProcessors.find(p => p.state === contractState)
  }

  private processError(errorCode: ErrorCode, errorName, message: string, extraData?: any, shouldLogError?: boolean) {
    if (shouldLogError) {
      this.logger.error(errorCode, errorName, extraData)
    }

    throw new InvalidMessageException(message, {
      errorCode,
      errorName,
      extraData
    })
  }

  private updateStatusData(presentation: ILCPresentation, status: LCPresentationStatus, performerId: string) {
    if (!presentation.stateHistory) {
      presentation.stateHistory = []
    }
    const lastHistoryState =
      presentation.stateHistory.length > 0
        ? presentation.stateHistory[presentation.stateHistory.length - 1].toState
        : null

    if (lastHistoryState !== status) {
      presentation.stateHistory.push({
        fromState: presentation.status,
        toState: status,
        performer: performerId,
        date: new Date()
      })
    }
    presentation.status = status
  }
}
