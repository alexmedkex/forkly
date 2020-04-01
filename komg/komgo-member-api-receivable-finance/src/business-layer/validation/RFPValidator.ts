import { ErrorCode } from '@komgo/error-utilities'
import { getLogger } from '@komgo/logging'
import { IQuote, IReceivablesDiscounting, IValidationErrors, ParticipantRFPStatus } from '@komgo/types'
import { injectable, inject } from 'inversify'

import {
  QuoteDataAgent,
  ReceivablesDiscountingDataAgent,
  RFPDataAgent,
  ReplyDataAgent
} from '../../data-layer/data-agents'
import { IReply } from '../../data-layer/models/replies/IReply'
import { IRFPRequest } from '../../data-layer/models/rfp/IRFPRequestDocument'
import { ErrorName } from '../../ErrorName'
import { TYPES } from '../../inversify/types'
import { VALUES } from '../../inversify/values'
import { ReceivablesDiscountingRFPRequest, QuoteSubmission, RFPReply, QuoteAccept } from '../../service-layer/requests'
import {
  EntityNotFoundError,
  ValidationDuplicateError,
  ValidationFieldError,
  InvalidPayloadProcessingError
} from '../errors'
import { CompanyRegistryClient } from '../microservice-clients'
import { RDInfoAggregator } from '../rd/RDInfoAggregator'

import { QuoteValidator } from './QuoteValidator'

@injectable()
export class RFPValidator {
  private logger = getLogger('RFPValidator')

  constructor(
    @inject(TYPES.ReceivablesDiscountingDataAgent) private readonly rdDataAgent: ReceivablesDiscountingDataAgent,
    @inject(TYPES.RFPDataAgent) private readonly rfpDataAgent: RFPDataAgent,
    @inject(TYPES.ReplyDataAgent) private readonly replyDataAgent: ReplyDataAgent,
    @inject(TYPES.QuoteDataAgent) private readonly quoteDataAgent: QuoteDataAgent,
    @inject(TYPES.CompanyRegistryClient) private readonly companyRegistryClient: CompanyRegistryClient,
    @inject(TYPES.RDInfoAggregator) private readonly rDInfoAggregator: RDInfoAggregator,
    @inject(TYPES.QuoteValidator) private readonly quoteValidator: QuoteValidator,
    @inject(VALUES.CompanyStaticId) private readonly companyStaticId: string
  ) {}

  /**
   * Validates ReceivablesDiscountingRFPRequest.
   * It will check that all participants in the list are members
   *
   * @param rfpRequest RFP request to validate
   * @throws ValidationFieldError if RD does not exists or participants are not all members
   * @throws ValidationDuplicateError if RFP already exists
   * @throws MicroserviceClientError if fails to retrieve data
   */
  public async validateRequest(rfpRequest: ReceivablesDiscountingRFPRequest): Promise<void> {
    await this.validateRdExists(rfpRequest.rdId)
    await this.validateRFPUnique(rfpRequest.rdId)
    await this.validateParticipants(rfpRequest.participantStaticIds)
  }

  /**
   * Checks that a RFP exists in DB given a rdID
   *
   * @param rdId rdId of the RFP to check in DB
   * @throws EntityNotFoundError if RD or RFP do not exist in DB
   * @returns the RFP Request if it exists
   */
  public async validateRFPExistsByRdId(rdId: string): Promise<IRFPRequest> {
    const rd = await this.rdDataAgent.findByStaticId(rdId)
    if (!rd) {
      throw new EntityNotFoundError(`RD does not exist with ID: ${rdId}`)
    }

    const rfp = await this.rfpDataAgent.findByRdId(rd.staticId)
    if (!rfp) {
      throw new EntityNotFoundError(`RD does not have an RFP`)
    }

    return rfp
  }

  /**
   * Validates QuoteSubmission.
   * It will check that the RD, RFP and quote exists (for that RD), and that a reply has not been sent yet for that RD
   *
   * @param quoteSubmission quote submission to validate
   * @throws ValidationFieldError if RD, RFP or quote do not exist in DB or if the quote is invalid
   * @throws ValidationDuplicateError if a reply already exists
   */
  public async validateQuoteSubmission(
    quoteSubmission: QuoteSubmission
  ): Promise<{
    rd: IReceivablesDiscounting
    rfp: IRFPRequest
    quote: IQuote
  }> {
    const { rd, rfp } = await this.validateRFPReply(quoteSubmission)
    await this.validateRFPReplyUnique(rd.staticId)
    const quote = await this.validateQuoteExists(quoteSubmission.quoteId)
    this.quoteValidator.validateFieldsExtended(quote, rd)
    await this.validateRFPReplyUnique(quoteSubmission.rdId)

    return { rd, rfp, quote }
  }

  /**
   * Validates QuoteAccept.
   * It will check that the RD, RFP and quote exists (for that RD), and that the RFP Summary is in a Submitted state
   * For an outbound quote accept message. (i.e. trader side)
   *
   * @param quoteAccept quote accept to validate
   * @throws ValidationFieldError if RD, RFP, quote do not exist in DB or if the summary is not in submitted state
   */
  public async validateOutboundQuoteAccept(
    quoteAccept: QuoteAccept
  ): Promise<{
    rd: IReceivablesDiscounting
    rfp: IRFPRequest
    quote: IQuote
  }> {
    const { rd, rfp } = await this.validateRFPReply(quoteAccept)
    const quote = await this.validateQuoteExists(quoteAccept.quoteId)
    this.quoteValidator.validateFieldsExtended(quote, rd)

    await this.validateRFPSummaryStateTransition(
      quoteAccept.rdId,
      quoteAccept.participantStaticId,
      [ParticipantRFPStatus.QuoteSubmitted],
      ParticipantRFPStatus.QuoteAccepted
    )

    return { rd, rfp, quote }
  }

  /**
   * Validates a RFP rejection.
   * It will check that the RD and RFP exists (for that RD), and that a reply has not been sent yet for that RD
   *
   * @param rfpReply RFP reply to validate
   * @throws ValidationFieldError if RD or RFP do not exist in DB
   * @throws ValidationDuplicateError if a reply already exists
   */
  public async validateRFPReject(
    rfpRejection: RFPReply
  ): Promise<{
    rd: IReceivablesDiscounting
    rfp: IRFPRequest
  }> {
    const { rd, rfp } = await this.validateRFPReply(rfpRejection)
    await this.validateRFPReplyUnique(rd.staticId)

    return { rd, rfp }
  }

  // TODO: integration test to check that if a quote is already rejected, we cannot
  // receive an accept
  /**
   * Checks that the rdId exists in DB and returns it
   * For an inbound quote accept message. (i.e. bank side)
   *
   * @param rdId staticId of the RD to validate
   */
  public async validateInboundQuoteAccept(rfpReply: IReply) {
    await this.validateRFPReply(rfpReply)
    await this.validateRFPSummaryStateTransition(
      rfpReply.rdId,
      this.companyStaticId,
      [ParticipantRFPStatus.QuoteSubmitted],
      ParticipantRFPStatus.QuoteAccepted
    )
  }

  /**
   * Checks that the rdId exists in DB and returns it
   * For an inbound quote decline message. (i.e. bank side)
   *
   * @param rfpReply RFP message with reply from trader
   */
  public async validateInboundQuoteDecline(rfpReply: IReply) {
    await this.validateRFPReply(rfpReply)
    await this.validateRFPSummaryStateTransition(
      rfpReply.rdId,
      this.companyStaticId,
      [ParticipantRFPStatus.QuoteSubmitted, ParticipantRFPStatus.Requested],
      ParticipantRFPStatus.QuoteDeclined
    )
  }

  /**
   * Validates that a RFP Reply has not already been processed
   *
   * @param rfpReply RFP Reply to validate
   * @param errorMessage error message
   */
  public async validateRFPReplyNotProcessed(rfpReply: IReply) {
    const errorMessage = 'RFP Reply was already processed'
    const savedRFPReply = await this.replyDataAgent.findByStaticId(rfpReply.staticId)
    if (savedRFPReply && new Date(savedRFPReply.createdAt).getTime() !== new Date(rfpReply.createdAt).getTime()) {
      this.logger.error(ErrorCode.ValidationInternalAMQP, ErrorName.DuplicateRFPReplyError, errorMessage, {
        savedRFPReply,
        receivedRFPReply: rfpReply
      })
      throw new InvalidPayloadProcessingError(errorMessage)
    }
  }

  /**
   * Validates a RFPReply.
   * It will check that the RD and RFP exists (for that RD)
   *
   * @param rfpReply RFP reply to validate
   * @throws ValidationFieldError if RD or RFP do not exist in DB
   */
  private async validateRFPReply(
    rfpReply: RFPReply
  ): Promise<{
    rd: IReceivablesDiscounting
    rfp: IRFPRequest
  }> {
    const rd = await this.validateRdExists(rfpReply.rdId)
    const rfp = await this.validateRFPExists(rfpReply.rdId)

    return { rd, rfp }
  }

  /**
   * Checks that the rdId exists in DB and returns it
   *
   * @param rdId staticId of the RD to validate
   */
  private async validateRdExists(rdId: string) {
    const existingRd = await this.rdDataAgent.findByStaticId(rdId)

    if (!existingRd) {
      const errorMessage = 'The specified Receivable discounting data could not be found'
      this.logger.error(ErrorCode.DatabaseInvalidData, ErrorName.RFPValidationRDNotFoundError, errorMessage, { rdId })
      throw new ValidationFieldError(errorMessage, {
        rdId: [errorMessage]
      })
    }

    return existingRd
  }

  /**
   * Checks that the rdId exists in DB and returns it
   *
   * @param rdId staticId of the RD to validate
   */
  private async validateRFPExists(rdId: string) {
    const existingRFP = await this.rfpDataAgent.findByRdId(rdId)

    if (!existingRFP) {
      const errorMessage = 'A Request for proposal could not be found for the given Receivable discounting application'
      this.logger.error(ErrorCode.DatabaseInvalidData, ErrorName.RFPValidationRFPNotFoundError, errorMessage, { rdId })
      throw new ValidationFieldError(errorMessage, {
        rdId: [errorMessage]
      })
    }

    return existingRFP
  }

  /**
   * Checks that a given RFP does not exist yet
   *
   * @param rdId rdId of the RFP to verify
   */
  private async validateRFPUnique(rdId: string) {
    const existingRd = await this.rfpDataAgent.findByRdId(rdId)

    if (existingRd) {
      this.logger.error(
        ErrorCode.DatabaseInvalidData,
        ErrorName.RFPValidationDuplicateError,
        'RFP Request for a RD with the specified id already exists',
        { rdId }
      )
      throw new ValidationDuplicateError('A Request for proposal already exists for the chosen RD application')
    }
  }

  /**
   * Checks that a given quote does not exist yet for a RD
   *
   * @param rdId rdId to verify
   */
  private async validateRFPReplyUnique(rdId: string) {
    const existingRfpReply = await this.replyDataAgent.findByRdId(rdId)

    if (existingRfpReply) {
      this.logger.error(
        ErrorCode.DatabaseInvalidData,
        ErrorName.RFPReplyValidationDuplicateError,
        'A reply for a RD with the specified id already exists',
        { rdId }
      )
      throw new ValidationDuplicateError('A reply has already been sent for the chosen RD application')
    }
  }

  /**
   * Checks that the quote exists in DB and returns it
   *
   * @param quoteId staticId of the quote to validate
   */
  private async validateQuoteExists(quoteId: string): Promise<IQuote> {
    const existingQuote = await this.quoteDataAgent.findByStaticId(quoteId)

    if (!existingQuote) {
      const errorMessage = 'The specified quote could not be found'

      this.logger.error(ErrorCode.DatabaseInvalidData, ErrorName.RFPValidationQuoteNotFoundError, errorMessage, {
        quoteId
      })
      throw new ValidationFieldError(errorMessage, {
        quoteId: [errorMessage]
      })
    }

    return existingQuote
  }

  /**
   * Checks that all participants in a RFP are komgo members
   *
   * @param participants List of participant static ids to check
   */
  private async validateParticipants(participants: string[]) {
    const membersStaticIds = await this.companyRegistryClient.getAllMembersStaticIds()

    const isAllMembers = participants.every(participant => membersStaticIds.some(staticId => participant === staticId))
    if (!isAllMembers) {
      const validationErrors: IValidationErrors = {
        participantStaticIds: ['All participants should be komgo members']
      }

      this.logger.error(
        ErrorCode.ValidationHttpContent,
        ErrorName.RFPParticipantNonMemberError,
        'RFP participants are not all komgo members',
        validationErrors
      )

      throw new ValidationFieldError('RFP request validation failed', validationErrors)
    }
  }

  /**
   *
   * @param rdId
   * @param participantStaticId
   * @param fromStates
   * @param toState
   */
  private async validateRFPSummaryStateTransition(
    rdId: string,
    participantStaticId: string,
    fromStates: ParticipantRFPStatus[],
    toState: ParticipantRFPStatus
  ) {
    const replies = await this.replyDataAgent.findAllByRdId(rdId)
    const summaries = await this.rDInfoAggregator.createParticipantRFPSummaries([participantStaticId], replies)
    const summary = summaries[0]

    if (summary.status === toState) {
      this.logger.error(
        ErrorCode.DatabaseInvalidData,
        ErrorName.RFPSummaryStateTransitionError,
        'A reply for a RD with the specified id already exists',
        { rdId }
      )
      throw new ValidationDuplicateError('A reply has already been (sent / received) for the chosen RD application')
    }

    if (!fromStates.includes(summary.status)) {
      const errorMessage =
        'The action cannot be performed for the specified Receivable Discounting application due to an invalid status'
      this.logger.error(ErrorCode.DatabaseInvalidData, ErrorName.RFPInvalidStatusForAction, errorMessage, { rdId })
      throw new ValidationFieldError(errorMessage, {
        rdId: [errorMessage]
      })
    }
  }
}
