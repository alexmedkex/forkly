import { IStandbyLetterOfCredit } from '@komgo/types'

export interface ISBLCDataAgent {
  save(sblc: IStandbyLetterOfCredit): Promise<string>
  get(staticId: string): Promise<IStandbyLetterOfCredit>
  getByContractAddress(contractAddress: string): Promise<IStandbyLetterOfCredit>
  update(conditions: any, sblc: IStandbyLetterOfCredit): Promise<IStandbyLetterOfCredit>
  getNonce(contractAddress: string): Promise<number>
  find(query?: object, projection?: object, options?: object): Promise<IStandbyLetterOfCredit[]>
  count(query?: object): Promise<number>
}
