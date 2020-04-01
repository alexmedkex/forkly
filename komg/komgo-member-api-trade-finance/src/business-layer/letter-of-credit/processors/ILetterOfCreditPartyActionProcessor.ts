import { ILetterOfCredit, IDataLetterOfCredit } from '@komgo/types'

export interface ILetterOfCreditPartyActionProcessor {
  executePartyActions(letterOfCredit: ILetterOfCredit<IDataLetterOfCredit>): Promise<void>
}
