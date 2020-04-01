import { inject, multiInject, injectable } from 'inversify'
import { TYPES } from '../../../../inversify/types'
import { ILCPresentationService } from '../../../lc-presentation/ILCPresentationService'
import { ILCPresentation } from '../../../../data-layer/models/ILCPresentation'
import { ILCPresentationDocument } from '../../../../data-layer/models/ILCPresentationDocument'
import {
  getLCPresentationStatus,
  LCPresentationContractStatus,
  getContractStatusByHash
} from '../LCPresentationContractStatus'
import { IEvent } from '../../../common/IEvent'
import { getPerformer, getCurrentPresentationRole } from '../LCPresentationRole'
import { LCPresentationStatus } from '@komgo/types'
import { ILCCacheDataAgent } from '../../../../data-layer/data-agents'
import { ILC } from '../../../../data-layer/models/ILC'
import { ILCPresentationContractCustomData } from '../ILCPresentationContractData'
import { ICompanyRegistryService } from '../../../../service-layer/ICompanyRegistryService'
import { ILCPresentationParties } from '../../../../data-layer/models/ILCPresentationParties'
import { getPresentationParties } from '../../../lc-presentation/getPresentationParties'
import * as _ from 'lodash'
import { getLogger } from '@komgo/logging'
import InvalidMessageException from '../../../../exceptions/InvalidMessageException'
import { ILCPresentationCreatedEvent } from './eventTypes/ILCPresentationCreatedEvent'
import { ILCPresentationCreatedProcessor } from './ILCPresentationCreatedProcessor'
import { ILCPresentationActionPerformer } from './ILCPresentationActionPerformer'
import { CONFIG } from '../../../../inversify/config'
import { ErrorCode } from '@komgo/error-utilities'
import { ErrorNames } from '../../../../exceptions/utils'

const web3Utils = require('web3-utils')

@injectable()
export class LCPresentationCreatedProcessor {
  private logger = getLogger('LCPresentationCreatedProcessor')

  constructor(
    @inject(TYPES.LCPresentationService) private readonly presentationService: ILCPresentationService,
    @multiInject(TYPES.LCPresentationCreatedStateProcessor)
    private readonly eventsProcessors: ILCPresentationCreatedProcessor[],
    @inject(TYPES.LCCacheDataAgent) private readonly lcCacheDataAgent: ILCCacheDataAgent,
    @inject(TYPES.CompanyRegistryService) private readonly companyRegistryService: ICompanyRegistryService,
    @inject(CONFIG.CompanyStaticId) private readonly companyId: string
  ) {}

  async processEvent(eventData: ILCPresentationCreatedEvent, event: IEvent) {
    const eventDecoded = eventData as ILCPresentationCreatedEvent
    this.logger.info('Processing LCPresentationCreated event', {
      transaction: event.transactionHash,
      address: event.address
    })

    const lcApplicationAddress = eventDecoded.lcAddress
    const contractStatus = getContractStatusByHash(eventDecoded.currentStateId)
    eventData.currentStateIdDecoded = contractStatus

    const contextEventData: any = {
      lcApplicationAddress,
      transactionHash: event.transactionHash,
      contractAddress: event.address,
      contractStatus
    }

    this.logger.info('Processing event', contextEventData)

    const lc = await this.lcCacheDataAgent.getLC({ contractAddress: lcApplicationAddress })

    this.checkLC(lc, event, lcApplicationAddress)

    contextEventData.lcReference = lc.reference

    try {
      const parties = await this.getPresentationEventParties(eventDecoded)
      this.verifyLCPresentationParties(lc, parties)

      const newPresentation = this.parsePresentationDataFromEvent(eventDecoded, lc, parties)
      let presentation = await this.presentationService.getLCPresentationByReference(newPresentation.reference)
      this.logger.info(
        !presentation ? 'New presentation data received' : 'Processing existing presentation data',
        contextEventData
      )

      if (!presentation) {
        presentation = newPresentation
      } else {
        contextEventData.presentationReference = presentation.reference
        presentation.beneficiaryComments = newPresentation.beneficiaryComments
        presentation.nominatedBankComments = newPresentation.nominatedBankComments
        presentation.issuingBankComments = newPresentation.issuingBankComments

        presentation.destinationState = null
      }

      const status = getLCPresentationStatus(contractStatus)
      const actionPerformer = getPerformer(newPresentation, contractStatus)

      this.checkActionPerformer(actionPerformer)

      this.prepareContractsData(presentation, eventData, event)
      this.prepareStatusData(presentation, status, actionPerformer.companyId)

      this.logger.info(`Saving presentation`)

      const currentRole = getCurrentPresentationRole(presentation, this.companyId)

      this.checkCurrentRole(currentRole)

      this.logger.info(`Processing as ${currentRole.role}`)

      presentation = await this.presentationService.updatePresentation(presentation)
      // TODO: map processors for other types of LCCreated event (deployed from other states - reviewing banks)
      const processor = this.getProcessorForState(eventData.currentStateIdDecoded)

      this.checkProcessor(processor, eventData)

      return processor.processEvent(presentation, event, currentRole, lc)
    } catch (error) {
      let errorCode = ErrorCode.ValidationExternalInboundAMQP
      let errorName = ErrorNames.ProcessingLCPresentationEventFailed
      let extraData

      if (error instanceof InvalidMessageException) {
        const err = error as InvalidMessageException

        if (err.errorData) {
          const { errorCode: errCode, errorName: errName, extraData: data } = err.errorData as any
          errorCode = errCode || errorCode
          errorName = errName || errorName
          extraData = data
        }
      }

      this.logger.error(
        errorCode || ErrorCode.ValidationExternalInboundAMQP,
        errorName || ErrorNames.ProcessingLCPresentationEventFailed,
        `Error processing LCPresentationCreatedEvent: ${error ? error.message : ''}`,
        {
          ...contextEventData,
          ...extraData
        },
        new Error().stack
      )

      throw error
    }
  }

  private checkActionPerformer(actionPerformer: ILCPresentationActionPerformer) {
    if (!actionPerformer) {
      throw this.processError(
        ErrorCode.DatabaseInvalidData,
        ErrorNames.ProcessingLCPresentationEventFailed,
        'Unknown action performer'
      )
    }
  }

  private checkProcessor(processor: ILCPresentationCreatedProcessor, eventData: ILCPresentationCreatedEvent) {
    if (!processor) {
      this.processError(
        ErrorCode.DatabaseMissingData,
        ErrorNames.ProcessingLCPresentationEventFailed,
        `Can't find processor for state ${eventData.currentStateIdDecoded}`
      )
    }
  }

  private checkLC(lc: ILC, event: IEvent, lcApplicationAddress: string) {
    if (!lc) {
      this.processError(
        ErrorCode.DatabaseMissingData,
        ErrorNames.ProcessingLCPresentationEventFailed,
        `LC with address ${lcApplicationAddress} not found`,
        {
          transactionHash: event.transactionHash,
          lcApplicationAddress
        },
        true
      )
    }
  }

  private checkCurrentRole(currentRole: ILCPresentationActionPerformer) {
    if (!currentRole) {
      throw this.processError(
        ErrorCode.DatabaseInvalidData,
        ErrorNames.ProcessingLCPresentationEventFailed,
        'Unknown action current role / performer'
      )
    }
  }

  private verifyLCPresentationParties(lc: ILC, parties: ILCPresentationParties): any {
    const lcParties = getPresentationParties(lc)

    if (!_.isEqual(lcParties, parties)) {
      this.processError(
        ErrorCode.DatabaseInvalidData,
        ErrorNames.ProcessingLCPresentationEventFailed,
        'Parties received from contract do not match LC parties',
        parties
      )
    }
  }

  private parsePresentationDataFromEvent(
    eventData: ILCPresentationCreatedEvent,
    lc: ILC,
    parties: ILCPresentationParties
  ) {
    const presentationData: ILCPresentationContractCustomData = JSON.parse(eventData.lcPresentationData)

    const docs = eventData.tradeDocuments.map(doc => ({
      documentTypeId: web3Utils.hexToString(doc[1]).trim(),
      docs: JSON.parse(doc[0])
    }))

    const documents: ILCPresentationDocument[] = []
    docs.forEach(docTypes => {
      docTypes.docs.forEach(doc => {
        documents.push({
          documentHash: doc,
          documentTypeId: docTypes.documentTypeId,
          dateProvided: new Date()
        })
      })
    })

    const presentation: ILCPresentation = {
      ...parties,
      staticId: presentationData.staticId,
      LCReference: lc.reference,
      reference: presentationData.lcPresentationReference,
      documents,
      beneficiaryComments: eventData.beneficiaryComments,
      nominatedBankComments: eventData.nominatedBankComments,
      issuingBankComments: eventData.issuingBankComments,
      status: getLCPresentationStatus(eventData.currentStateIdDecoded)
    }

    return presentation
  }

  private prepareContractsData(
    presentationData: ILCPresentation,
    eventData: ILCPresentationCreatedEvent,
    event: IEvent
  ) {
    if (!presentationData.contracts) {
      presentationData.contracts = []
    }

    presentationData.contracts.push({
      contractAddress: event.address,
      transactionHash: event.transactionHash,
      key: eventData.currentStateIdDecoded
    })
  }

  private prepareStatusData(presentation: ILCPresentation, status: LCPresentationStatus, performerId: string) {
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

  private async getPresentationEventParties(
    eventDecoded: ILCPresentationCreatedEvent
  ): Promise<ILCPresentationParties> {
    const nodes = [
      eventDecoded.beneficiaryGuid,
      eventDecoded.nominatedBankGuid,
      eventDecoded.issuingBankGuid,
      eventDecoded.applicantGuid
    ].filter(node => node.indexOf('0x00') !== 0)

    const members = await this.companyRegistryService.getMembersByNode(nodes)

    return {
      beneficiaryId: this.getMemberStaticId(eventDecoded.beneficiaryGuid, members),
      applicantId: this.getMemberStaticId(eventDecoded.applicantGuid, members),
      issuingBankId: this.getMemberStaticId(eventDecoded.issuingBankGuid, members),
      nominatedBankId: this.getMemberStaticId(eventDecoded.nominatedBankGuid, members)
    }
  }

  private getMemberStaticId(node: string, members) {
    const member = members.find(m => m.node === node)

    return member ? member.staticId : null
  }

  private getProcessorForState(contractState: LCPresentationContractStatus) {
    const processor = this.eventsProcessors.find(p => p.state === contractState)
    if (!processor) {
      this.processError(
        ErrorCode.DatabaseMissingData,
        ErrorNames.ProcessingLCPresentationEventFailed,
        `Can't find processor for state ${contractState}`
      )
    }
    return processor
  }

  private processError(errorCode, errorName, message: string, extraData?: any, shouldLogError?: boolean) {
    // new logger - this.logger.error(errorCode, errorName, message, extraData)

    if (shouldLogError) {
      this.logger.error(errorCode, errorName, message, {
        extraData
      })
    }

    throw new InvalidMessageException(message)
  }
}
