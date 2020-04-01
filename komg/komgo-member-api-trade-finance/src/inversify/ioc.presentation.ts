import { ILCPresentationService } from '../business-layer/lc-presentation/ILCPresentationService'
import { LCPresentationService } from '../business-layer/lc-presentation/LCPresentationService'
import { LCPresentationContract } from '../business-layer/blockchain/LCPresentationContract'
import { LCPresentationEventsProcessor } from '../business-layer/events/LCPresentation/LCPresentationEventsProcessor'
import { ILCPresentationCreatedProcessor } from '../business-layer/events/LCPresentation/eventProcessors/ILCPresentationCreatedProcessor'
import { LCPresentationSubmittedProcessor } from '../business-layer/events/LCPresentation/eventProcessors/createdEvents/LCPresentationSubmittedProcessor'
import { LCPresentationTransitionProcessor } from '../business-layer/events/LCPresentation/eventProcessors/LCPresentationTransitionProcessor'
import * as LCPresentationCreated from '../business-layer/events/LCPresentation/eventProcessors/createdEvents/LCPresentationCompliantByNominatedBankProcessor'

import { LCPresentationReleasedToApplicantProcessor } from '../business-layer/events/LCPresentation/eventProcessors/createdEvents/LCPresentationReleasedToApplicantProcessor'
import {
  ILCPresentationTransactionManager,
  LCPresentationTransactionManager
} from '../business-layer/blockchain/LCPresentationTransactionManager'
import { LCPresentationCreatedProcessor } from '../business-layer/events/LCPresentation/eventProcessors/LCPresentationCreatedProcessor'
import {
  ILCPresentationTaskFactory,
  LCPresentationTaskFactory
} from '../business-layer/tasks/LCPresentationTaskFactory'
import { ILCPresentationReviewService } from '../business-layer/lc-presentation/ILCPresentationReviewService'
import { LCPresentationReviewService } from '../business-layer/lc-presentation/LCPresentationReviewService'
import { ILCPresentationTransitionStateProcessor } from '../business-layer/events/LCPresentation/eventProcessors/ILCPresentationTransitionStateProcessor'
import { LCPresentationCompliantByNominatedBankProcessor } from '../business-layer/events/LCPresentation/eventProcessors/transitionEvents/LCPresentationCompliantByNominatedBankProcessor'
import { LCPresentationCompliantByIssuingBankProcessor } from '../business-layer/events/LCPresentation/eventProcessors/transitionEvents/LCPresentationCompliantByIssuingBankProcessor'
import {
  ILCPresentationNotificationProcessor,
  LCPresentationNotificationProcessor
} from '../business-layer/tasks/LCPresentationNotificationProcessor'

import { LCPresentationDiscrepantByIssuingBankProcessor } from '../business-layer/events/LCPresentation/eventProcessors/transitionEvents/LCPresentationDiscrepantByIssuingBankProcessor'
import { LCPresentationDiscrepantByNominatedBankProcessor } from '../business-layer/events/LCPresentation/eventProcessors/transitionEvents/LCPresentationDiscrepantByNominatedBankProcessor'
import { LCPresentationDataUpdatedProcessor } from '../business-layer/events/LCPresentation/eventProcessors/LCPresentationDataUpdatedProcessor'
import { LCPresentationDiscrepanciesAdvisedByIssuingBankProcessor } from '../business-layer/events/LCPresentation/eventProcessors/transitionEvents/advisingDisrepancies/LCPresentationDiscrepanciesAdvisedByIssuingBankProcessor'
import { LCPresentationDiscrepanciesAdvisedByNominatedBankProcessor } from '../business-layer/events/LCPresentation/eventProcessors/transitionEvents/advisingDisrepancies/LCPresentationDiscrepanciesAdvisedByNominatedBankProcessor'
import { LCPresentationDiscrepanciesAdvisedByIssuingBankProcessor as LCPresentationDiscrepanciesAdvisedByIssuingBankCreatedProcessor } from '../business-layer/events/LCPresentation/eventProcessors/createdEvents/LCPresentationDiscrepanciesAdvisedByIssuingBankProcessor'
import { LCPresentationDiscrepanciesAdvisedByNominatedBankProcessor as LCPresentationDiscrepanciesAdvisedByNominatedBankCreatedProcessor } from '../business-layer/events/LCPresentation/eventProcessors/createdEvents/LCPresentationDiscrepanciesAdvisedByNominatedBankProcessor'
import { IEventsProcessor } from '../business-layer/common/IEventsProcessor'
import { ILCPresentationDataAgent } from '../data-layer/data-agents'
import { LCPresentationDataAgent } from '../data-layer/data-agents/lc-presentation/LCPresentationDataAgent'
import { TYPES } from './types'
import { Container } from 'inversify'
import { LCPresentationDiscrepanciesAcceptedByIssuingBankProcessor } from '../business-layer/events/LCPresentation/eventProcessors/transitionEvents/advisingDisrepancies/LCPresentationDiscrepanciesAcceptedByIssuingBankProcessor'
import { LCPresentationDiscrepanciesRejectedByIssuingBankProcessor } from '../business-layer/events/LCPresentation/eventProcessors/transitionEvents/advisingDisrepancies/LCPresentationDiscrepanciesRejectedByIssuingBankProcessor'
import { LCPresentationDiscrepanciesAcceptedByApplicantProcessor } from '../business-layer/events/LCPresentation/eventProcessors/transitionEvents/advisingDisrepancies/LCPresentationDiscrepanciesAcceptedByApplicantProcessor'
import { LCPresentationDiscrepanciesRejectedByApplicantProcessor } from '../business-layer/events/LCPresentation/eventProcessors/transitionEvents/advisingDisrepancies/LCPresentationDiscrepanciesRejectedByApplicantProcessor'

export const registerPresentationComponents = (iocContainer: Container) => {
  iocContainer.bind<ILCPresentationDataAgent>(TYPES.LCPresentationDataAgent).to(LCPresentationDataAgent)

  iocContainer.bind<ILCPresentationService>(TYPES.LCPresentationService).to(LCPresentationService)
  iocContainer.bind<ILCPresentationReviewService>(TYPES.LCPresentationReviewService).to(LCPresentationReviewService)

  iocContainer
    .bind<ILCPresentationTransactionManager>(TYPES.LCPresentationTransactionManager)
    .to(LCPresentationTransactionManager)
  iocContainer.bind<LCPresentationContract>(TYPES.LCPresentationContract).to(LCPresentationContract)
  iocContainer.bind<IEventsProcessor>(TYPES.EventsProcessor).to(LCPresentationEventsProcessor)

  iocContainer
    .bind<LCPresentationCreatedProcessor>(TYPES.LCPresentationCreatedProcessor)
    .to(LCPresentationCreatedProcessor)
  iocContainer
    .bind<ILCPresentationCreatedProcessor>(TYPES.LCPresentationCreatedStateProcessor)
    .to(LCPresentationSubmittedProcessor)
  iocContainer
    .bind<ILCPresentationCreatedProcessor>(TYPES.LCPresentationCreatedStateProcessor)
    .to(LCPresentationCreated.LCPresentationCompliantByNominatedBankProcessor)
  iocContainer
    .bind<ILCPresentationCreatedProcessor>(TYPES.LCPresentationCreatedStateProcessor)
    .to(LCPresentationReleasedToApplicantProcessor)
  iocContainer
    .bind<ILCPresentationCreatedProcessor>(TYPES.LCPresentationCreatedStateProcessor)
    .to(LCPresentationDiscrepanciesAdvisedByIssuingBankCreatedProcessor)
  iocContainer
    .bind<ILCPresentationCreatedProcessor>(TYPES.LCPresentationCreatedStateProcessor)
    .to(LCPresentationDiscrepanciesAdvisedByNominatedBankCreatedProcessor)

  iocContainer
    .bind<ILCPresentationTransitionStateProcessor>(TYPES.LCPresentationTransitionStateProcessor)
    .to(LCPresentationDiscrepantByNominatedBankProcessor)
  iocContainer
    .bind<ILCPresentationTransitionStateProcessor>(TYPES.LCPresentationTransitionStateProcessor)
    .to(LCPresentationDiscrepantByIssuingBankProcessor)

  iocContainer
    .bind<ILCPresentationTransitionStateProcessor>(TYPES.LCPresentationTransitionStateProcessor)
    .to(LCPresentationDiscrepanciesAdvisedByNominatedBankProcessor)
  iocContainer
    .bind<ILCPresentationTransitionStateProcessor>(TYPES.LCPresentationTransitionStateProcessor)
    .to(LCPresentationDiscrepanciesAdvisedByIssuingBankProcessor)

  iocContainer
    .bind<ILCPresentationTransitionStateProcessor>(TYPES.LCPresentationTransitionStateProcessor)
    .to(LCPresentationDiscrepanciesAcceptedByIssuingBankProcessor)

  iocContainer
    .bind<ILCPresentationTransitionStateProcessor>(TYPES.LCPresentationTransitionStateProcessor)
    .to(LCPresentationDiscrepanciesRejectedByIssuingBankProcessor)

  iocContainer
    .bind<ILCPresentationTransitionStateProcessor>(TYPES.LCPresentationTransitionStateProcessor)
    .to(LCPresentationDiscrepanciesRejectedByApplicantProcessor)
  iocContainer
    .bind<ILCPresentationTransitionStateProcessor>(TYPES.LCPresentationTransitionStateProcessor)
    .to(LCPresentationDiscrepanciesAcceptedByApplicantProcessor)

  iocContainer
    .bind<LCPresentationTransitionProcessor>(TYPES.LCPresentationTransitionProcessor)
    .to(LCPresentationTransitionProcessor)

  iocContainer
    .bind<LCPresentationDataUpdatedProcessor>(TYPES.LCPresentationDataUpdatedProcessor)
    .to(LCPresentationDataUpdatedProcessor)

  iocContainer
    .bind<ILCPresentationTransitionStateProcessor>(TYPES.LCPresentationTransitionStateProcessor)
    .to(LCPresentationCompliantByNominatedBankProcessor)

  iocContainer
    .bind<ILCPresentationTransitionStateProcessor>(TYPES.LCPresentationTransitionStateProcessor)
    .to(LCPresentationCompliantByIssuingBankProcessor)

  iocContainer.bind<ILCPresentationTaskFactory>(TYPES.LCPresentationTaskFactory).to(LCPresentationTaskFactory)
  iocContainer
    .bind<ILCPresentationNotificationProcessor>(TYPES.LCPresentationNotificationProcessor)
    .to(LCPresentationNotificationProcessor)
}
