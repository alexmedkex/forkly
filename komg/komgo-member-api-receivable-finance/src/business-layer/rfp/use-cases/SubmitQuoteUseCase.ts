import { getLogger } from '@komgo/logging'
import { ICreateRFPResponse, IQuote, IReceivablesDiscounting, IRFPReplyResponse, ReplyType } from '@komgo/types'
import { inject, injectable } from 'inversify'
import { v4 as uuid4 } from 'uuid'

import { ReplyDataAgent } from '../../../data-layer/data-agents/ReplyDataAgent'
import { IReply } from '../../../data-layer/models/replies/IReply'
import { TYPES, VALUES } from '../../../inversify'
import { QuoteSubmission } from '../../../service-layer/requests'
import { getContextForTask } from '../../../utils'
import { TaskClient } from '../../microservice-clients'
import { RFPClient } from '../../microservice-clients/RFPClient'
import { TaskType } from '../../types'
import { RFPValidator } from '../../validation'
import { ReplyFactory } from '../ReplyFactory'

@injectable()
export class SubmitQuoteUseCase {
  private readonly logger = getLogger('SubmitQuoteUseCase')

  constructor(
    @inject(TYPES.RFPValidator) private readonly rfpValidator: RFPValidator,
    @inject(VALUES.CompanyStaticId) private readonly companyStaticId: string,
    @inject(TYPES.ReplyDataAgent) private readonly replyDataAgent: ReplyDataAgent,
    @inject(TYPES.RFPClient) private readonly rfpClient: RFPClient,
    @inject(TYPES.TaskClient) private readonly taskClient: TaskClient,
    @inject(TYPES.ReplyFactory) private readonly replyFactory: ReplyFactory
  ) {}

  /**
   * Submits a new quote for a given request for proposal by validating, saving and sending it to RFP MS
   *
   * @param quoteSubmission Quote submission request to process
   */
  public async execute(quoteSubmission: QuoteSubmission, userId: string): Promise<IRFPReplyResponse> {
    this.logger.info('Submitting Quote', quoteSubmission)

    const { rd, rfp, quote } = await this.rfpValidator.validateQuoteSubmission(quoteSubmission)

    await this.taskClient.completeTask(
      TaskType.RequestTaskType,
      userId,
      getContextForTask(rd.staticId, rfp.senderStaticId)
    )

    this.logger.info('Sending RFP Response')
    const rfpReply = this.replyFactory.createQuoteReply(
      rd,
      ReplyType.Submitted,
      quote,
      this.companyStaticId,
      quoteSubmission.comment
    )
    const rfpResponse = this.createRFPResponse(rfpReply, quote)
    const result = await this.rfpClient.postRFPResponse(rfp.rfpId, rfpResponse, ReplyType.Submitted)

    await this.replyDataAgent.create(rfpReply)

    this.logger.info('Quote successfully submitted', {
      response: result
    })

    return result
  }

  private createRFPResponse(rfpReply: IReply, quote: IQuote): ICreateRFPResponse {
    return {
      responseData: {
        quote,
        rfpReply
      }
    }
  }
}
