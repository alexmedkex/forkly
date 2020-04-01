import { IEvent } from './IEvent'

export interface IEventsProcessor {
  processEvent(event: IEvent): Promise<any>
  getEventMappings()
}
