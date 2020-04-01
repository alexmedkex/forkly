import { ILetterOfCredit, IDataLetterOfCredit } from '@komgo/types'

export interface ILetterOfCreditMessagingService {
  sendMessageTo(partyStaticId: string, lc: ILetterOfCredit<IDataLetterOfCredit>): Promise<string>
}
