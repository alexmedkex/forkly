import { getLogger } from '@komgo/logging'
import { ICreateRFPResponse, IQuote, IRFPAcceptResponse, ReplyType } from '@komgo/types'
import { inject, injectable } from 'inversify'

import { ReplyDataAgent } from '../../../data-layer/data-agents'
import { IReply } from '../../../data-layer/models/replies/IReply'
import { TYPES } from '../../../inversify'
import { QuoteAccept } from '../../../service-layer/requests'
import { getContextForTask } from '../../../utils'
import { RFPClient, TaskClient } from '../../microservice-clients'
import { TaskType } from '../../types'
import { RFPValidator } from '../../validation'
import { ReplyFactory } from '../ReplyFactory'

@injectable()
export class AcceptQuoteUseCase {
  private readonly logger = getLogger('AcceptQuoteUseCase')

  constructor(
    @inject(TYPES.RFPValidator) private readonly rfpValidator: RFPValidator,
    @inject(TYPES.ReplyDataAgent) private readonly replyDataAgent: ReplyDataAgent,
    @inject(TYPES.RFPClient) private readonly rfpClient: RFPClient,
    @inject(TYPES.TaskClient) private readonly taskClient: TaskClient,
    @inject(TYPES.ReplyFactory) private readonly replyFactory: ReplyFactory
  ) {}

  /**
   * Accepts a new quote for a given request for proposal by validating, saving and sending it to RFP MS
   *
   * @param quoteAccept Quote accept data request to process
   */
  public async execute(quoteAccept: QuoteAccept, userId: string): Promise<IRFPAcceptResponse> {
    this.logger.info('Accepting Quote', quoteAccept)

    const { rd, rfp, quote } = await this.rfpValidator.validateOutboundQuoteAccept(quoteAccept)

    await this.completeAllTasks(userId, rd.staticId)

    const rfpReply = this.replyFactory.createQuoteReply(
      rd,
      ReplyType.Accepted,
      quote,
      quoteAccept.participantStaticId,
      quoteAccept.comment
    )
    const rfpResponse = this.createRFPResponse(rfpReply, quote, quoteAccept.participantStaticId)
    const result = await this.rfpClient.postRFPAccept(rfp.rfpId, rfpResponse)

    this.logger.info('Saving RFP reply in DB')
    await this.replyDataAgent.create(rfpReply)

    this.logger.info('Quote successfully accepted', {
      response: result
    })

    return result
  }

  private createRFPResponse(rfpReply: IReply, quote: IQuote, participantStaticId: string): ICreateRFPResponse {
    return {
      responseData: {
        quote,
        rfpReply
      },
      participantStaticId
    }
  }

  private async completeAllTasks(userId: string, rdId: string) {
    const submittedReplies = (await this.replyDataAgent.findAllByRdId(rdId)).filter(
      reply => reply.type === ReplyType.Submitted
    )
    for (const reply of submittedReplies) {
      await this.taskClient.completeTask(
        TaskType.ResponseTaskType,
        userId,
        getContextForTask(rdId, reply.senderStaticId)
      )
    }
  }
}
