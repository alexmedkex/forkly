export interface IEventsProcessor {
  getDeployedContracts(): Promise<any[]>
  processEventsBatch(from, to): Promise<any>
  processEvent(event): Promise<any>
}
