import { ErrorCode } from '@komgo/error-utilities'
import { getLogger } from '@komgo/logging'
import { ReplyType, IReceivablesDiscounting } from '@komgo/types'
import { inject, injectable } from 'inversify'

import { ReceivablesDiscountingDataAgent, ReplyDataAgent } from '../../data-layer/data-agents'
import { IReply } from '../../data-layer/models/replies/IReply'
import { ErrorName } from '../../ErrorName'
import { TYPES } from '../../inversify'
import { EntityNotFoundError, ValidationFieldError } from '../errors'

@injectable()
export class AcceptedRDValidator {
  private readonly logger = getLogger('AcceptedRDValidator')
  constructor(
    @inject(TYPES.ReceivablesDiscountingDataAgent) private readonly rdDataAgent: ReceivablesDiscountingDataAgent,
    @inject(TYPES.ReplyDataAgent) private readonly replyDataAgent: ReplyDataAgent
  ) {}

  public async validateRDAccepted(
    rdId: string
  ): Promise<{
    rd: IReceivablesDiscounting
    acceptedReply: IReply
  }> {
    const rd = await this.rdDataAgent.findByStaticId(rdId)
    if (!rd) {
      this.logger.warn(ErrorCode.DatabaseMissingData, ErrorName.RDNotFoundForUpdate, 'RD not found', { rdId })
      throw new EntityNotFoundError(`Receivable Discounting data not found with ID - ${rdId}`)
    }

    const acceptedReply = await this.replyDataAgent.findByRdIdAndType(rdId, ReplyType.Accepted)
    if (!acceptedReply) {
      const msg = 'RFP Reply not found for the given RD and type'
      this.logger.error(ErrorCode.DatabaseMissingData, ErrorName.RFPReplyNotFound, msg, {
        rdId,
        replyType: ReplyType.Accepted
      })
      throw new ValidationFieldError(msg, {
        error: ['The corresponding Receivable discounting has not been accepted']
      })
    }
    return { rd, acceptedReply }
  }
}
