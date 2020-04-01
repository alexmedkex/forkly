import { ILetterOfCredit, IDataLetterOfCredit } from '@komgo/types'

export interface ILetterOfCreditReceivedService {
  processEvent(message: ILetterOfCredit<IDataLetterOfCredit>): Promise<boolean>
}
