import { ErrorCode } from '@komgo/error-utilities'
import { getLogger } from '@komgo/logging'
import { IRequestForProposal, ActionType, ActionStatus, IAction } from '@komgo/types'
import { injectable, inject } from 'inversify'

import { ActionDataAgent } from '../../data-layer/data-agents/ActionDataAgent'
import { RequestForProposalDataAgent } from '../../data-layer/data-agents/RequestForProposalDataAgent'
import { ErrorName } from '../../ErrorName'
import { TYPES } from '../../inversify/types'
import { VALUES } from '../../inversify/values'
import CompanyRegistryClient from '../company-registry/CompanyRegistryClient'
import InvalidActionReplyError from '../errors/InvalidActionReplyError'
import InvalidDataError from '../errors/InvalidDataError'
import MissingRequiredData from '../errors/MissingRequiredData'
import RFPNotFoundError from '../errors/RFPNotFoundError'

@injectable()
export class RFPValidator {
  private readonly logger = getLogger('RFPValidator')
  constructor(
    @inject(TYPES.RequestForProposalDataAgent) private readonly rfpDataAgent: RequestForProposalDataAgent,
    @inject(TYPES.ActionDataAgent) private readonly actionDataAgent: ActionDataAgent,
    @inject(TYPES.CompanyRegistryClient) private readonly companyRegistryClient: CompanyRegistryClient,
    @inject(VALUES.CompanyStaticId) private readonly companyStaticId: string
  ) {}

  public async validateRFPExists(rfpId: string): Promise<IRequestForProposal> {
    const rfp: IRequestForProposal = await this.rfpDataAgent.findOneByStaticId(rfpId)
    if (!rfp) {
      this.logger.error(ErrorCode.DatabaseMissingData, ErrorName.RFPNotFound, 'RFP not found', { rfpId })
      throw new RFPNotFoundError(`RFP with ${rfpId} does not exist`, rfpId)
    }
    return rfp
  }

  public async validateLatestActionExists(
    rfpId: string,
    actionType: ActionType,
    actionStatus: ActionStatus
  ): Promise<IAction> {
    const action: IAction = await this.actionDataAgent.findLatestByRFPIdAndActionType(rfpId, actionType, actionStatus)
    if (!action) {
      this.logger.error(ErrorCode.DatabaseMissingData, ErrorName.ActionNotFound, { rfpId })
      throw new MissingRequiredData(`Action not found for RFP - ${rfpId}`)
    }
    return action
  }

  /**
   * Check if a Response/Reject is allowed
   *
   * @param rfpId RFP ID
   */
  public async validateOutboundReplyAllowed(rfpId: string, actionType: ActionType) {
    // check accept and decline in the future
    const action: IAction = await this.actionDataAgent.findLatestByRFPIdAndActionType(
      rfpId,
      ActionType.Reject,
      ActionStatus.Processed,
      this.companyStaticId
    )
    if (action !== null) {
      throw new InvalidActionReplyError(`Action ${actionType} is not valid for rfpId=${rfpId}`, rfpId)
    }
  }

  // TODO: move this logic into the usecase
  public async validateOutboundAcceptAllowed(rfpId: string, participantStaticId: string): Promise<void> {
    await this.validateResponseReceivedFromParticipant(rfpId, participantStaticId)
    await this.validateRejectNotReceivedFromParticipant(rfpId, participantStaticId)
    await this.validateActionTypeNotSentToParticipant(rfpId, ActionType.Decline, participantStaticId)
    await this.validateAcceptNotSentToAnyParticipant(rfpId)
  }

  public async validateInboundReplyAllowed(rfpId: string, actionType: ActionType, senderStaticId: string) {
    // check accept and decline in the future
    const action: IAction = await this.actionDataAgent.findLatestByRFPIdAndActionType(
      rfpId,
      ActionType.Reject,
      ActionStatus.Processed,
      senderStaticId
    )
    if (action !== null) {
      throw new InvalidActionReplyError(`Action ${actionType} is not valid for rfpId=${rfpId}`, rfpId)
    }
  }

  /**
   * Validate that the Action received is new or has not been processed yet
   * @param actionId
   */
  public async validateActionStatus(actionId: string) {
    const action: IAction = await this.actionDataAgent.findOneByStaticId(actionId)
    if (action && action.status !== ActionStatus.Created) {
      this.logger.warn(ErrorCode.ValidationKomgoInboundAMQP, ErrorName.InboundActionDuplicatedError, {
        actionId: action.staticId
      })
      throw new InvalidDataError(`Duplicated ${action.type} action`, action.rfpId)
    }
  }

  public async validateSenderDetails(senderStaticID: string) {
    const senderCompanyDetails = await this.companyRegistryClient.getEntryFromStaticId(senderStaticID)
    if (!senderCompanyDetails) {
      throw new InvalidDataError(`Company with ${senderStaticID} does not exist in registry`)
    }
    return senderCompanyDetails
  }

  public async validateActionTypeExistsFromParticipant(
    rfpId: string,
    actionType: ActionType,
    status: ActionStatus,
    participantStaticId: string
  ) {
    const responseAction: IAction = await this.actionDataAgent.findLatestByRFPIdAndActionType(
      rfpId,
      actionType,
      status,
      participantStaticId
    )
    if (!responseAction) {
      throw new InvalidActionReplyError(
        `RFP does not have ActionType ${actionType} from participant ${participantStaticId}`,
        rfpId
      )
    }
  }

  public async validateActionTypesNotReceivedFromParticipant(
    rfpId: string,
    actionTypes: ActionType[],
    participantStaticId: string
  ) {
    const actions = await this.actionDataAgent.findActionsByRFPIdAndActionTypes(
      rfpId,
      actionTypes,
      ActionStatus.Processed,
      participantStaticId
    )
    if (actions && actions.length > 0) {
      let errorActionTypesMsg: string = ''
      for (const action of actions) {
        errorActionTypesMsg += `${action.type} `
      }
      const errorMsg = `RFP has received the following action(s) ${errorActionTypesMsg} from participant`
      this.logger.error(ErrorCode.ValidationInvalidOperation, ErrorName.ActionsReceivedError, errorMsg, {
        rfpId,
        participantStaticId
      })

      throw new InvalidActionReplyError(errorMsg, rfpId)
    }
  }

  public async validateActionTypeNotSentToParticipant(
    rfpId: string,
    actionType: ActionType,
    participantStaticId: string
  ) {
    const action = await this.actionDataAgent.findLatestByRFPIdAndActionType(
      rfpId,
      actionType,
      ActionStatus.Processed,
      this.companyStaticId,
      participantStaticId
    )
    if (action) {
      throw new InvalidActionReplyError(
        `RFP  has ActionType ${actionType} from participant ${participantStaticId}`,
        rfpId
      )
    }
  }

  public async validateResponseReceivedFromParticipant(rfpId: string, participantStaticId: string) {
    await this.validateActionTypeExistsFromParticipant(
      rfpId,
      ActionType.Response,
      ActionStatus.Processed,
      participantStaticId
    )
  }

  public async validateRejectNotReceivedFromParticipant(rfpId: string, participantStaticId: string) {
    await this.validateActionTypesNotReceivedFromParticipant(rfpId, [ActionType.Reject], participantStaticId)
  }

  private async validateAcceptNotSentToAnyParticipant(rfpId: string) {
    await this.validateActionTypesNotReceivedFromParticipant(rfpId, [ActionType.Accept], this.companyStaticId)
  }
}
