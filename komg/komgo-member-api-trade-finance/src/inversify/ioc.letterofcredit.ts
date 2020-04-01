import { Container } from 'inversify'
import { TYPES } from './types'
import { ILetterOfCreditDataAgent, LetterOfCreditDataAgent } from '../data-layer/data-agents'
import { LetterOfCreditService } from '../business-layer/letter-of-credit/services/LetterOfCreditService'
import {
  ILetterOfCreditTransactionManager,
  LetterOfCreditTransactionManager,
  ILetterOfCreditContract,
  LetterOfCreditContract
} from '../business-layer/letter-of-credit/tx-managers'
import { LetterOfCreditMessagingService } from '../business-layer/letter-of-credit/messaging/LetterOfCreditMessagingService'
import { ILetterOfCreditMessagingService } from '../business-layer/letter-of-credit/messaging/ILetterOfCreditMessagingService'
import { ILetterOfCreditReceivedService } from '../business-layer/letter-of-credit/services/ILetterOfCreditReceivedService'
import { LetterOfCreditReceivedService } from '../business-layer/letter-of-credit/services/LetterOfCreditReceivedService'
import { IMessageEventProcessor } from '../business-layer/message-processing/IMessageEventProcessor'
import { LetterOfCreditMessageProcessor } from '../business-layer/letter-of-credit/message-processing/LetterOfCreditMessageProcessor'
import { IMessagePublishingService } from '../business-layer/message-processing/IMessagePublishingService'
import { MessagePublishingService } from '../business-layer/message-processing/MessagePublishingService'
import { IEventsProcessor } from '../business-layer/common/IEventsProcessor'
import { LetterOfCreditCreatedService } from '../business-layer/letter-of-credit/services/LetterOfCreditCreatedService'
import { ILetterOfCreditEventService } from '../business-layer/letter-of-credit/services/ILetterOfCreditEventService'
import { LetterOfCreditEventsProcessor } from '../business-layer/letter-of-credit/events/LetterOfCreditEventsProcessor'
import { LetterOfCreditTaskManager } from '../business-layer/letter-of-credit/tasks/LetterOfCreditTaskManager'
import { ILetterOfCreditTaskManager } from '../business-layer/letter-of-credit/tasks/ILetterOfCreditTaskManager'
import { ILetterOfCreditNotificationManager } from '../business-layer/letter-of-credit/notifications/ILetterOfCreditNotificationManager'
import { LetterOfCreditNotificationManager } from '../business-layer/letter-of-credit/notifications/LetterOfCreditNotificationManager'
import { LetterOfCreditPartyActionProcessor } from '../business-layer/letter-of-credit/processors/LetterOfCreditPartyActionProcessor'
import { ILetterOfCreditPartyActionProcessor } from '../business-layer/letter-of-credit/processors/ILetterOfCreditPartyActionProcessor'
import {
  LetterOfCreditTransitionService,
  LetterOfCreditNonceIncrementedService
} from '../business-layer/letter-of-credit/services'
import { LetterOfCreditDocumentService } from '../business-layer/letter-of-credit/services/LetterOfCreditDocumentService'
import { ILetterOfCreditDocumentService } from '../business-layer/letter-of-credit/services/ILetterOfCreditDocumentService'
import { LetterOfCreditPartyActionProcessorHelper } from '../business-layer/letter-of-credit/processors/LetterOfCreditPartyActionProcessorHelper'
import { ILetterOfCreditPartyActionProcessorHelper } from '../business-layer/letter-of-credit/processors/ILetterOfCreditPartyActionProcessorHelper'
import { LetterOfCreditPartyActionProcessorOnIssued } from '../business-layer/letter-of-credit/processors/LetterOfCreditPartyActionProcessorOnIssued'
import { LetterOfCreditPartyActionProcessorOnRequested } from '../business-layer/letter-of-credit/processors/LetterOfCreditPartyActionProcessorOnRequested'
import { LetterOfCreditPartyActionProcessorOnRequestRejected } from '../business-layer/letter-of-credit/processors/LetterOfCreditPartyActionProcessorOnRequestRejected'

export const registerLetterOfCreditComponents = (container: Container) => {
  container.bind<ILetterOfCreditDataAgent>(TYPES.LetterOfCreditDataAgent).to(LetterOfCreditDataAgent)

  container
    .bind<ILetterOfCreditTransactionManager>(TYPES.LetterOfCreditTransactionManager)
    .to(LetterOfCreditTransactionManager)

  container.bind<ILetterOfCreditContract>(TYPES.LetterOfCreditContract).to(LetterOfCreditContract)

  container
    .bind<ILetterOfCreditMessagingService>(TYPES.LetterOfCreditMessagingService)
    .to(LetterOfCreditMessagingService)

  container.bind<LetterOfCreditService>(TYPES.LetterOfCreditService).to(LetterOfCreditService)

  container.bind<ILetterOfCreditReceivedService>(TYPES.LetterOfCreditReceivedService).to(LetterOfCreditReceivedService)

  container.bind<IMessageEventProcessor>(TYPES.MessageEventProcessor).to(LetterOfCreditMessageProcessor)

  container.bind<IMessagePublishingService>(TYPES.MessagePublishingService).to(MessagePublishingService)

  container.bind<IEventsProcessor>(TYPES.EventsProcessor).to(LetterOfCreditEventsProcessor)

  container.bind<ILetterOfCreditEventService>(TYPES.LetterOfCreditCreatedService).to(LetterOfCreditCreatedService)

  container.bind<ILetterOfCreditTaskManager>(TYPES.LetterOfCreditTaskManager).to(LetterOfCreditTaskManager)

  container
    .bind<ILetterOfCreditNotificationManager>(TYPES.LetterOfCreditNotificationManager)
    .to(LetterOfCreditNotificationManager)

  container
    .bind<ILetterOfCreditPartyActionProcessor>(TYPES.LetterOfCreditPartyActionProcessor)
    .to(LetterOfCreditPartyActionProcessor)

  container.bind<ILetterOfCreditEventService>(TYPES.LetterOfCreditTransitionService).to(LetterOfCreditTransitionService)

  container
    .bind<ILetterOfCreditEventService>(TYPES.LetterOfCreditNonceIncrementedService)
    .to(LetterOfCreditNonceIncrementedService)

  container.bind<ILetterOfCreditDocumentService>(TYPES.LetterOfCreditDocumentService).to(LetterOfCreditDocumentService)

  container
    .bind<ILetterOfCreditPartyActionProcessorHelper>(TYPES.LetterOfCreditPartyActionProcessorHelper)
    .to(LetterOfCreditPartyActionProcessorHelper)

  container
    .bind<ILetterOfCreditPartyActionProcessor>(TYPES.LetterOfCreditPartyActionProcessorOnRequestRejected)
    .to(LetterOfCreditPartyActionProcessorOnRequestRejected)

  container
    .bind<ILetterOfCreditPartyActionProcessor>(TYPES.LetterOfCreditPartyActionProcessorOnRequested)
    .to(LetterOfCreditPartyActionProcessorOnRequested)

  container
    .bind<ILetterOfCreditPartyActionProcessor>(TYPES.LetterOfCreditPartyActionProcessorOnIssued)
    .to(LetterOfCreditPartyActionProcessorOnIssued)
}
