import { ErrorCode } from '@komgo/error-utilities'
import { getLogger } from '@komgo/logging'
import { ReplyType } from '@komgo/types'
import { injectable, inject } from 'inversify'

import { ReplyDataAgent } from '../../data-layer/data-agents'
import { ErrorName } from '../../ErrorName'
import { TYPES } from '../../inversify/types'
import { removeTimeFromDates } from '../../utils'
import { ValidationDuplicateError } from '../errors'
import { OutboundPublisher, OutboundMessageFactory } from '../messaging'
import { AddDiscountingRequestType } from '../messaging/types/AddDiscountingRequestType'
import { ReplyFactory } from '../rfp/ReplyFactory'
import { AcceptedRDValidator } from '../validation'
import { AddDiscountingValidator } from '../validation/AddDiscountingValidator'

@injectable()
export class AddDiscountingUseCase {
  private readonly logger = getLogger('ShareRDUseCase')

  constructor(
    @inject(TYPES.AcceptedRDValidator) private readonly acceptedRDValidator: AcceptedRDValidator,
    @inject(TYPES.AddDiscountingValidator) private readonly addDiscountingValidator: AddDiscountingValidator,
    @inject(TYPES.ReplyDataAgent) private readonly replyDataAgent: ReplyDataAgent,
    @inject(TYPES.ReplyFactory) private readonly replyFactory: ReplyFactory,
    @inject(TYPES.OutboundMessageFactory)
    private readonly outboundMessageFactory: OutboundMessageFactory,
    @inject(TYPES.OutboundPublisher) private readonly outboundPublisher: OutboundPublisher
  ) {}

  public async execute(rdId: string): Promise<void> {
    this.logger.info('Adding discounting', { rdId })
    const { rd, acceptedReply } = await this.acceptedRDValidator.validateRDAccepted(rdId)
    this.addDiscountingValidator.validate(removeTimeFromDates(rd))

    await this.validateAddDiscountingRequest(rdId)

    const reply = this.replyFactory.createRDReply(rd, ReplyType.AddDiscountingRequest, acceptedReply.senderStaticId)
    await this.replyDataAgent.create(reply)
    this.logger.info('Saved Add discounting reply', { rdId })

    const outboundMessage = this.outboundMessageFactory.createAddDiscountingMessage(
      rdId,
      rd,
      AddDiscountingRequestType.Add,
      reply
    )
    await this.outboundPublisher.send(acceptedReply.participantId, outboundMessage)
    this.logger.info('Add discounting request sent successfully', {
      rdId,
      recipient: acceptedReply.participantId
    })
  }

  private async validateAddDiscountingRequest(rdId: string) {
    const existingReply = await this.replyDataAgent.findByRdIdAndType(rdId, ReplyType.AddDiscountingRequest)
    if (existingReply) {
      this.logger.error(
        ErrorCode.DatabaseInvalidData,
        ErrorName.AddDiscoutingRequestExists,
        'Add discounting request for RD exists',
        { rdId }
      )
      throw new ValidationDuplicateError('Add discouting request has already been sent for the chosen RD')
    }
  }
}
