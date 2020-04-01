export interface ITradeInstrumentValidationService {
  validateById(tradeId: string): Promise<boolean>
  validateBySourceId(source: string, sourceId: string): Promise<boolean>
}
