import { ILetterOfCredit, IDataLetterOfCredit } from '@komgo/types'

export interface ILetterOfCreditTransactionManager {
  deploy(params: ILetterOfCredit<IDataLetterOfCredit>): Promise<any>
  issue(contractAddress: string, params: ILetterOfCredit<IDataLetterOfCredit>): Promise<any>
  requestReject(contractAddress: string): Promise<any>
}
