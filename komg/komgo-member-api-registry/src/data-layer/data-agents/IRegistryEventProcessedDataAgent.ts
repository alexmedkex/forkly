export interface IRegistryEventProcessedDataAgent {
  getLastEventProcessed(): Promise<any>
  createOrUpdate(blockNumber: number, transactionIndex: number, logIndex: number): Promise<any>
}