import { ILCPresentationEvent } from './eventTypes/ILCPresentationEvent'
import { IEvent } from '../../../common/IEvent'

export interface ILCPresentationEventProcessor {
  processEvent(eventData: ILCPresentationEvent, event: IEvent)
}
