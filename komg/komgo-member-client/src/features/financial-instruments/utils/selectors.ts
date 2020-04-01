import { get } from 'lodash'
import { ILetterOfCredit } from '../../letter-of-credit-legacy/types/ILetterOfCredit'
import { Roles } from '../../letter-of-credit-legacy/constants/roles'
import { IDataLetterOfCredit, IStandbyLetterOfCredit } from '@komgo/types'
import { IMember } from '../../members/store/types'
import { ImmutableObject } from '../../../utils/types'

export const findRole = (letter: ILetterOfCredit | IStandbyLetterOfCredit, companyStaticId?: string): string => {
  return Object.entries(letter).reduce<string>((memo: string, [key, value]): string => {
    if (value === companyStaticId) {
      switch (key) {
        case 'applicantId':
          return Roles.APPLICANT
        case 'beneficiaryId':
          return Roles.BENEFICIARY
        case 'issuingBankId':
          return Roles.ISSUING_BANK
        case 'beneficiaryBankId':
          return letter.beneficiaryBankRole!
        default:
          return memo
      }
    }
    return memo
  }, Roles.UNKNOWN)
}

export const findParticipantCommonNames = (letter: ILetterOfCredit | IStandbyLetterOfCredit, members: IMember[]) => {
  const getCommonNameByParticipantId = (participantId: string) =>
    get(members.find((m: IMember) => m.staticId === (letter as any)[participantId]), 'x500Name.CN')
  return {
    applicant: getCommonNameByParticipantId('applicantId'),
    beneficiary: getCommonNameByParticipantId('beneficiaryId'),
    issuingBank: getCommonNameByParticipantId('issuingBankId'),
    beneficiaryBank: getCommonNameByParticipantId('beneficiaryBankId')
  }
}
