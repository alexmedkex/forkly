import { ILetterOfCredit, IDataLetterOfCredit } from '@komgo/types'

export interface ILetterOfCreditDataAgent {
  save(letterOfCredit: ILetterOfCredit<IDataLetterOfCredit>): Promise<string>
  get(staticId: string): Promise<ILetterOfCredit<IDataLetterOfCredit>>
  getByContractAddress(contractAddress: string): Promise<ILetterOfCredit<IDataLetterOfCredit>>
  update(conditions: any, fields: any): Promise<ILetterOfCredit<IDataLetterOfCredit>>
  getNonce(contractAddress: string): Promise<number>
  find(query?: object, projection?: object, options?: object): Promise<Array<ILetterOfCredit<IDataLetterOfCredit>>>
  count(query?: object): Promise<number>
  getByTransactionHash(transactionHash: string): Promise<ILetterOfCredit<IDataLetterOfCredit>>
}
