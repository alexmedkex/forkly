export interface ICommonEventProcessor {
  processEvent(data: any, source: string)
}

export interface IEventProcessor<TData> extends ICommonEventProcessor {
  processEvent(data: TData, source: string)
}
