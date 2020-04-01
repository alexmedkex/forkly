import { getLogger } from '@komgo/logging'
import { ICreateRFPResponse, IReceivablesDiscounting, IRFPReplyResponse, ReplyType } from '@komgo/types'
import { inject, injectable } from 'inversify'
import { v4 as uuid4 } from 'uuid'

import { ReplyDataAgent } from '../../../data-layer/data-agents'
import { IReply } from '../../../data-layer/models/replies/IReply'
import { TYPES, VALUES } from '../../../inversify'
import { RFPReply } from '../../../service-layer/requests'
import { getContextForTask } from '../../../utils'
import { RFPClient, TaskClient } from '../../microservice-clients'
import { TaskType } from '../../types'
import { RFPValidator } from '../../validation'

@injectable()
export class RejectRFPUseCase {
  private readonly logger = getLogger('RejectRFPUseCase')

  constructor(
    @inject(TYPES.RFPValidator) private readonly rfpValidator: RFPValidator,
    @inject(VALUES.CompanyStaticId) private readonly companyStaticId: string,
    @inject(TYPES.ReplyDataAgent) private readonly replyDataAgent: ReplyDataAgent,
    @inject(TYPES.RFPClient) private readonly rfpClient: RFPClient,
    @inject(TYPES.TaskClient) private readonly taskClient: TaskClient
  ) {}

  /**
   * rejects a RFP for a given request for proposal by validating, saving and sending it to RFP MS
   *
   * @param rfpRejection RFP rejection request to process
   */
  public async execute(rfpRejection: RFPReply, userId: string): Promise<IRFPReplyResponse> {
    this.logger.info('Rejecting RFP', { reply: { ...rfpRejection, comment: '[redacted]' } })

    const { rd, rfp } = await this.rfpValidator.validateRFPReject(rfpRejection)

    await this.taskClient.completeTask(
      TaskType.RequestTaskType,
      userId,
      getContextForTask(rd.staticId, rfp.senderStaticId)
    )

    const rfpReply = this.createRFPReply(rd, ReplyType.Reject, rfpRejection.comment)
    const rfpResponse = this.createRFPResponse(rfpReply)
    const result = await this.rfpClient.postRFPResponse(rfp.rfpId, rfpResponse, ReplyType.Reject)

    await this.replyDataAgent.create(rfpReply)

    this.logger.info('RFP rejection sucessuflly submitted', {
      response: result
    })

    return result
  }

  private createRFPReply(rd: IReceivablesDiscounting, type: ReplyType, comment?: string): IReply {
    return {
      staticId: uuid4(),
      rdId: rd.staticId,
      type,
      senderStaticId: this.companyStaticId,
      participantId: this.companyStaticId,
      comment
    }
  }

  private createRFPResponse(rfpReply: IReply): ICreateRFPResponse {
    return {
      responseData: { rfpReply }
    }
  }
}
