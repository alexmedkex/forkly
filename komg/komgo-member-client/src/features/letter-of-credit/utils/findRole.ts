import { IDataLetterOfCredit, ILetterOfCredit } from '@komgo/types'
import { Roles } from '../../letter-of-credit-legacy/constants/roles'

export const findRole = (letter: ILetterOfCredit<IDataLetterOfCredit>, companyStaticId: string): string => {
  return Object.entries(letter.templateInstance.data).reduce<string>((memo: string, [key, value]): string => {
    const staticId = value && value.staticId
    if (staticId === companyStaticId) {
      switch (key) {
        case 'applicant':
          return Roles.APPLICANT
        case 'beneficiary':
          return Roles.BENEFICIARY
        case 'issuingBank':
          return Roles.ISSUING_BANK
        case 'beneficiaryBank':
        // TODO LS implement the role
        default:
          return memo
      }
    }
    return memo
  }, Roles.UNKNOWN)
}
