import { ErrorCode } from '@komgo/error-utilities'
import { getLogger } from '@komgo/logging'
import { injectable, inject } from 'inversify'

import OutgoingRequestDataAgent from '../../../data-layer/data-agents/OutgoingRequestDataAgent'
import { TYPES } from '../../../inversify/types'
import { ErrorName } from '../../../utils/ErrorName'
import { EVENT_NAME } from '../enums'
import { DocumentRequestDismissTypeMessage } from '../messages/DocumentRequestDismissTypeMessage'

import { IEventProcessor } from './IEventProcessor'

@injectable()
export class DocumentRequestDismissTypeProcessor implements IEventProcessor<DocumentRequestDismissTypeMessage> {
  private readonly logger = getLogger('DocumentRequestDismissTypeProcessor')

  constructor(
    @inject(TYPES.OutgoingRequestDataAgent) private readonly outgoingRequestDataAgent: OutgoingRequestDataAgent
  ) {}

  async processEvent(senderStaticId: string, event: DocumentRequestDismissTypeMessage): Promise<void> {
    this.logger.info('Processing dimissed document types', { senderStaticId, event })

    try {
      const productId = event.context.productId
      const requestId = event.data.requestId

      await this.outgoingRequestDataAgent.findAndUpdate(productId, requestId, {
        dismissedTypes: event.data.dismissedTypes
      })
    } catch (error) {
      this.logger.error(
        ErrorCode.ValidationInternalAMQP,
        ErrorName.DocumentRequestEventError,
        'Error processing a dismissed document type event',
        {
          senderStaticId,
          errorMessage: error.message,
          event
        }
      )
    }
  }

  eventType(): any {
    return DocumentRequestDismissTypeMessage
  }

  eventNames(): string[] {
    return [EVENT_NAME.RequestDocumentsDismissedTypes]
  }
}
