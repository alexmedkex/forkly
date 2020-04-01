export default interface IEventsProcessor {
  processEvent(eventName: string, eventData: object): Promise<boolean>
}
