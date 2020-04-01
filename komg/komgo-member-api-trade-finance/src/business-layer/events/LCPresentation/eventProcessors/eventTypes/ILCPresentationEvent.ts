import { ILCPresentationCreatedEvent } from './ILCPresentationCreatedEvent'
import { ILCPresentationTransitionEvent } from './ILCPresentationTransitionEvent'
import { ILCPresentationDataUpdatedEvent } from './ILCPresentationDataUpdatedEvent'

export type ILCPresentationEvent =
  | ILCPresentationCreatedEvent
  | ILCPresentationTransitionEvent
  | ILCPresentationDataUpdatedEvent
