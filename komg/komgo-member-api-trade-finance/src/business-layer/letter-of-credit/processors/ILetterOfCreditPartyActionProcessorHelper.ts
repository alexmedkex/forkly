import { ILetterOfCredit, IDataLetterOfCredit, CompanyRoles } from '@komgo/types'

export interface ILetterOfCreditPartyActionProcessorHelper {
  getPartyAction(
    letterOfCredit: ILetterOfCredit<IDataLetterOfCredit>,
    partyRole: CompanyRoles,
    actions: Map<string, any>
  ): (letterOfCredit: ILetterOfCredit<IDataLetterOfCredit>) => Promise<void>
  getPartyRole(letterOfCredit: ILetterOfCredit<IDataLetterOfCredit>): CompanyRoles
  getLetterOfCreditType(letterOfCredit: ILetterOfCredit<IDataLetterOfCredit>): string
}
