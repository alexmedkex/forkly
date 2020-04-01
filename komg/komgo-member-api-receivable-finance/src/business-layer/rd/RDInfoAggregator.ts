import { ErrorCode } from '@komgo/error-utilities'
import { getLogger } from '@komgo/logging'
import {
  IReceivablesDiscounting,
  IReceivablesDiscountingInfo,
  RDStatus,
  ITradeSnapshot,
  IParticipantRFPReply,
  ParticipantRFPStatus,
  IParticipantRFPSummary,
  ReplyType
} from '@komgo/types'
import { injectable, inject } from 'inversify'

import { QuoteDataAgent, RFPDataAgent, ReplyDataAgent, TradeSnapshotDataAgent } from '../../data-layer/data-agents'
import { IReply } from '../../data-layer/models/replies/IReply'
import { IRFPRequest } from '../../data-layer/models/rfp/IRFPRequestDocument'
import { ErrorName } from '../../ErrorName'
import { TYPES } from '../../inversify/types'
import { VALUES } from '../../inversify/values'
import { Metric } from '../../Metric'
import { EntityNotFoundError } from '../errors'

@injectable()
export class RDInfoAggregator {
  private readonly logger = getLogger('RDInfoAggregator')

  constructor(
    @inject(TYPES.TradeSnapshotDataAgent) private readonly tradeSnapshotDataAgent: TradeSnapshotDataAgent,
    @inject(TYPES.RFPDataAgent) private readonly rfpDataAgent: RFPDataAgent,
    @inject(TYPES.QuoteDataAgent) private readonly quoteDataAgent: QuoteDataAgent,
    @inject(TYPES.ReplyDataAgent) private readonly replyDataAgent: ReplyDataAgent,
    @inject(VALUES.CompanyStaticId) private readonly companyStaticId: string
  ) {}

  /**
   * Completes a RD application by adding the trade, RFP request and status
   *
   * @param rd Receivable Discounting application to complete
   */
  public async aggregate(rd: IReceivablesDiscounting): Promise<IReceivablesDiscountingInfo> {
    if (!rd) {
      const errorMessage = 'Receivables discounting not found'
      this.logger.warn(ErrorCode.DatabaseMissingData, ErrorName.ReceivablesDiscountingNotFound, errorMessage)
      throw new EntityNotFoundError(errorMessage)
    }

    const tradeSnapshot = await this.tradeSnapshotDataAgent.findByTradeSourceId(rd.tradeReference.sourceId)
    const rfpRequest = await this.rfpDataAgent.findByRdId(rd.staticId)

    let summaries: IParticipantRFPSummary[] = []
    if (rfpRequest) {
      const rfpReplies = await this.replyDataAgent.findAllByRdId(rd.staticId)

      // As a bank, the list of participants is empty
      const isStaticIdsEmpty = rfpRequest.participantStaticIds.length === 0
      const participantStaticIds = isStaticIdsEmpty ? [this.companyStaticId] : rfpRequest.participantStaticIds
      summaries = await this.createParticipantRFPSummaries(participantStaticIds, rfpReplies)
    }

    const status = this.summariseRDStatus(rfpRequest, summaries)
    const acceptedParticipantStaticId = this.findAcceptedParticipantStaticId(status, summaries)

    this.logger.metric({
      [Metric.RDStatus]: status,
      [Metric.RDSummariesNumber]: summaries.length,
      [Metric.ParticipantSummariesInfo]: summaries.map(summary => {
        return {
          participantStaticId: summary.participantStaticId,
          participantRFPStatus: summary.status,
          nbReplies: summary.replies.length
        }
      }),
      rdId: rd.staticId
    })

    this.logger.info('Creating IReceivableDiscountingInfo', { rdId: rd.staticId, status })
    return this.createIRDInfo(rd, tradeSnapshot, rfpRequest, status, acceptedParticipantStaticId)
  }

  /**
   * Creates the summary for each participant of a RFP by aggregating the necessary data and computing its status
   *
   * @param participantStaticIds List of participants static ids
   * @param replies List of replies of a given RD
   */
  public async createParticipantRFPSummaries(
    participantStaticIds: string[],
    rfpReplies: IReply[]
  ): Promise<IParticipantRFPSummary[]> {
    const repliesByParticipantId = {}
    const quoteAcceptedReply = rfpReplies.find(reply => reply.type === ReplyType.Accepted)

    for (const reply of rfpReplies) {
      const participantReply = await this.constructParticipantReply(reply)
      repliesByParticipantId[reply.participantId] = [
        ...(repliesByParticipantId[reply.participantId] || []),
        participantReply
      ]
    }
    return participantStaticIds.map(participantStaticId => {
      const replies = repliesByParticipantId[participantStaticId] || []
      const status = this.summariseParticipantRFPStatus(participantStaticId, replies, quoteAcceptedReply)

      return { participantStaticId, status, replies }
    })
  }

  private async constructParticipantReply(reply: IReply): Promise<IParticipantRFPReply> {
    const quote = reply.quoteId ? await this.quoteDataAgent.findByStaticId(reply.quoteId) : undefined
    return {
      type: reply.type,
      comment: reply.comment,
      createdAt: reply.createdAt,
      senderStaticId: reply.senderStaticId,
      quote
    }
  }

  private summariseParticipantRFPStatus(
    participantStaticId: string,
    replies?: IReply[],
    quoteAcceptedReply?: IReply
  ): ParticipantRFPStatus {
    if (quoteAcceptedReply) {
      if (quoteAcceptedReply.participantId === participantStaticId) {
        return ParticipantRFPStatus.QuoteAccepted
      }

      if (replies.some(reply => reply.type === ReplyType.Declined || reply.type === ReplyType.Submitted)) {
        return ParticipantRFPStatus.QuoteDeclined
      }

      if (replies.some(reply => reply.type === ReplyType.Reject)) {
        return ParticipantRFPStatus.Rejected
      }

      if (!replies || replies.length === 0) {
        return ParticipantRFPStatus.RequestExpired
      }
    } else {
      if (replies.some(reply => reply.type === ReplyType.Declined)) {
        return ParticipantRFPStatus.QuoteDeclined
      }

      if (replies.some(reply => reply.type === ReplyType.Submitted)) {
        return ParticipantRFPStatus.QuoteSubmitted
      }

      if (replies.some(reply => reply.type === ReplyType.Reject)) {
        return ParticipantRFPStatus.Rejected
      }

      if (!replies || replies.length === 0) {
        return ParticipantRFPStatus.Requested
      }
    }
  }

  private summariseRDStatus(rfp: IRFPRequest, summaries: IParticipantRFPSummary[]): RDStatus {
    if (!rfp) {
      return RDStatus.PendingRequest
    }

    const some = (status: ParticipantRFPStatus) => summaries.some(summary => summary.status === status)
    const every = (status: ParticipantRFPStatus) => summaries.every(summary => summary.status === status)

    if (some(ParticipantRFPStatus.QuoteAccepted)) {
      return RDStatus.QuoteAccepted
    }
    if (some(ParticipantRFPStatus.QuoteSubmitted)) {
      return RDStatus.QuoteSubmitted
    }
    if (every(ParticipantRFPStatus.Rejected)) {
      return RDStatus.RequestDeclined
    }
    if (every(ParticipantRFPStatus.QuoteDeclined)) {
      /**
       * There is only one summary if this is a bank, so we use 'summaries.every' (double check this)
       * A trader could not have submitted a quote
       */
      const memberSubmittedQuote = summaries.every(summary =>
        summary.replies.some(reply => reply.quote && reply.senderStaticId === this.companyStaticId)
      )
      return memberSubmittedQuote ? RDStatus.QuoteDeclined : RDStatus.RequestExpired
    }
    return RDStatus.Requested
  }

  private createIRDInfo(
    rd: IReceivablesDiscounting,
    tradeSnapshot: ITradeSnapshot,
    rfp: IRFPRequest,
    status: RDStatus,
    acceptedParticipantStaticId: string
  ): IReceivablesDiscountingInfo {
    const rfpInfo = rfp ? { participantStaticIds: rfp.participantStaticIds, createdAt: rfp.createdAt } : undefined

    return { rd, tradeSnapshot, rfp: rfpInfo, status, acceptedParticipantStaticId }
  }

  private findAcceptedParticipantStaticId(status: RDStatus, summaries: IParticipantRFPSummary[]) {
    let acceptedParticipantStaticId: string
    if (status === RDStatus.QuoteAccepted) {
      const acceptedSummary = summaries.find(summary => summary.status === ParticipantRFPStatus.QuoteAccepted)
      acceptedParticipantStaticId = acceptedSummary.participantStaticId
    }

    return acceptedParticipantStaticId
  }
}
