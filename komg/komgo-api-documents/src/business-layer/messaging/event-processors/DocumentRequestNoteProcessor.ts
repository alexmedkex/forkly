import { ErrorCode } from '@komgo/error-utilities'
import { getLogger } from '@komgo/logging'
import { inject, injectable } from 'inversify'
import * as _ from 'lodash'

import IncomingRequestDataAgent from '../../../data-layer/data-agents/IncomingRequestDataAgent'
import OutgoingRequestDataAgent from '../../../data-layer/data-agents/OutgoingRequestDataAgent'
import { MetricNames, Directions } from '../../../infrastructure/metrics/consts'
import { metric } from '../../../infrastructure/metrics/metrics'
import { TYPES } from '../../../inversify/types'
import { ErrorName } from '../../../utils/ErrorName'
import { EVENT_NAME } from '../enums'
import { DocumentRequestNoteMessage, NOTE_ORIGIN } from '../messages/DocumentRequestNoteMessage'

import { IEventProcessor } from './IEventProcessor'

const documentRequestSentMetric = metric(MetricNames.DocumentRequestNoteSent)

/**
 * Processes document requests events.
 */
@injectable()
export class DocumentRequestNoteProcessor implements IEventProcessor<DocumentRequestNoteMessage> {
  private readonly logger = getLogger('DocumentRequestNoteProcessor')

  constructor(
    @inject(TYPES.IncomingRequestDataAgent) private readonly incomingRequestDataAgent: IncomingRequestDataAgent,
    @inject(TYPES.OutgoingRequestDataAgent) private readonly outgoingRequestDataAgent: OutgoingRequestDataAgent
  ) {}

  async processEvent(senderStaticId: string, event: DocumentRequestNoteMessage): Promise<void> {
    const loggedEvent = _.cloneDeep(event)
    loggedEvent.data.note.content = '[retracted]'
    this.logger.info('Processing documents request note', { senderStaticId, event: loggedEvent })
    try {
      const productId = event.context.productId
      const requestId = event.data.requestId
      const origin = event.data.origin
      const note = event.data.note

      // decide where to persist the note depending on where the note comes from (SENDER / RECEIVER)
      // if coming from a IncomingRequest (RECEIVER) then store it in outgoing-requests collection
      // if coming from a OutgoingRequest (SENDER) then store it in incoming-requests collection
      // other option that those, log error and do not process message
      switch (origin) {
        case NOTE_ORIGIN.IncomingRequest: {
          await this.outgoingRequestDataAgent.findAndUpdate(productId, requestId, {
            $push: { notes: note }
          })
          break
        }
        case NOTE_ORIGIN.OutgoingRequest: {
          await this.incomingRequestDataAgent.findAndUpdate(productId, requestId, {
            $push: { notes: note }
          })
          break
        }
        default: {
          this.logger.error(ErrorCode.UnexpectedError, 'UnexpectedNoteOrigin', {
            requestId,
            origin
          })
        }
      }

      documentRequestSentMetric.record(Directions.Inbound)
    } catch (error) {
      this.logger.error(
        ErrorCode.ValidationInternalAMQP,
        ErrorName.DocumentRequestNoteEventError,
        'Received a request note but was unable to be processed',
        {
          senderStaticId,
          errorMessage: error.message,
          event: loggedEvent
        }
      )
    }
  }

  eventNames(): string[] {
    return [EVENT_NAME.RequestDocumentsNote]
  }

  eventType(): any {
    return DocumentRequestNoteMessage
  }
}
