import { ICounterparty } from './ICounterparty'

export interface ICounterpartyClient {
  getCounterparties(query?): Promise<ICounterparty[]>
}
