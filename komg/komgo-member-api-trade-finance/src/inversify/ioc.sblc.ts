import { Container } from 'inversify'
import { TYPES } from './types'
import { SBLCService } from '../business-layer/sblc/SBLCService'
import { ISBLCService } from '../business-layer/sblc/ISBLCService'
import { ISBLCDataAgent, SBLCDataAgent } from '../data-layer/data-agents'
import { ISBLCTransactionManager } from '../business-layer/blockchain/SBLC/ISBLCTransactionManager'
import { SBLCTransactionManager } from '../business-layer/blockchain/SBLC/SBLCTransactionManager'
import { ISBLCContract } from '../business-layer/blockchain/SBLC/ISBLCContract'
import { SBLCContract } from '../business-layer/blockchain/SBLC/SBLCContract'
import { ISBLCEventService } from '../business-layer/events/SBLC/ISBLCEventService'
import { SBLCCreatedService } from '../business-layer/events/SBLC/SBLCCreatedService'
import { SBLCEventsProcessor } from '../business-layer/events/SBLC/SBLCEventsProcessor'
import { IEventsProcessor } from '../business-layer/common/IEventsProcessor'
import { SBLCNonceIncrementedService } from '../business-layer/events/SBLC/SBLCNonceIncrementedService'
import { ISBLCDocumentManager, SBLCDocumentManager } from '../business-layer/events/SBLC/SBLCDocumentManager'
import { SBLCTransitionService } from '../business-layer/events/SBLC/SBLCTransitionService'
import { SBLCDataUpdatedEventService } from '../business-layer/events/SBLC/SBLCDataUpdatedEventService'
import { SBLCIssuedEventService } from '../business-layer/events/SBLC/SBLCIssuedEventService'
import { SBLCRejectRequestEventService } from '../business-layer/events/SBLC/SBLCRejectRequestEventService'

export const registerSBLCComponents = (container: Container) => {
  container.bind<ISBLCService>(TYPES.SBLCService).to(SBLCService)
  container.bind<ISBLCDataAgent>(TYPES.SBLCDataAgent).to(SBLCDataAgent)
  container.bind<ISBLCTransactionManager>(TYPES.SBLCTransactionManager).to(SBLCTransactionManager)
  container.bind<ISBLCContract>(TYPES.SBLCContract).to(SBLCContract)
  container.bind<IEventsProcessor>(TYPES.EventsProcessor).to(SBLCEventsProcessor)
  container.bind<ISBLCEventService>(TYPES.SBLCCreatedService).to(SBLCCreatedService)
  container.bind<ISBLCEventService>(TYPES.SBLCNonceIncrementedService).to(SBLCNonceIncrementedService)
  container.bind<ISBLCDocumentManager>(TYPES.SBLCDocumentManager).to(SBLCDocumentManager)
  container.bind<ISBLCEventService>(TYPES.SBLCTransitionService).to(SBLCTransitionService)
  container.bind<ISBLCEventService>(TYPES.SBLCDataUpdatedEventService).to(SBLCDataUpdatedEventService)
  container.bind<ISBLCEventService>(TYPES.SBLCIssuedEventService).to(SBLCIssuedEventService)
  container.bind<ISBLCEventService>(TYPES.SBLCRejectRequestEventService).to(SBLCRejectRequestEventService)
}
