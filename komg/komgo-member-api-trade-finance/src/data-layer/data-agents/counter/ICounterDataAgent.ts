export interface ICounterDataAgent {
  getCounterAndUpdate(type: string, context: any): Promise<number>
}
