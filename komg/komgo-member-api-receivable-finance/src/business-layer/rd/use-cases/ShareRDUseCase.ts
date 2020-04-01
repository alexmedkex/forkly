import { getLogger } from '@komgo/logging'
import { injectable, inject } from 'inversify'

import { TYPES } from '../../../inversify/types'
import { OutboundPublisher, OutboundMessageFactory } from '../../messaging'
import { UpdateType } from '../../types'
import { AcceptedRDValidator } from '../../validation'

@injectable()
export class ShareRDUseCase {
  private readonly logger = getLogger('ShareRDUseCase')

  constructor(
    @inject(TYPES.AcceptedRDValidator) private readonly acceptedRDValidator: AcceptedRDValidator,
    @inject(TYPES.OutboundMessageFactory)
    private readonly outboundMessageFactory: OutboundMessageFactory,
    @inject(TYPES.OutboundPublisher) private readonly outboundPublisher: OutboundPublisher
  ) {}

  public async execute(rdId: string): Promise<void> {
    this.logger.info('Sharing Receivable discounting', { rdId })

    const { rd, acceptedReply } = await this.acceptedRDValidator.validateRDAccepted(rdId)
    const outboundMessage = this.outboundMessageFactory.createRDUpdateMessage(
      rdId,
      rd,
      UpdateType.ReceivablesDiscounting
    )
    // Here the bank shares with the trader, so the recipient static id is the participant of the reply
    await this.outboundPublisher.send(acceptedReply.participantId, outboundMessage)

    this.logger.info('RD shared successfully', {
      rdId
    })
  }
}
