import { findRole, findParticipantCommonNames } from './selectors'
import { Roles } from '../../letter-of-credit-legacy/constants/roles'
import { fakeLetterOfCredit, fakeMember } from '../../letter-of-credit-legacy/utils/faker'
import { ILetterOfCredit } from '../../letter-of-credit-legacy/types/ILetterOfCredit'
import { IMember } from '../../members/store/types'

describe('findRole', () => {
  const letter = fakeLetterOfCredit()

  const companyStaticIds = new Map<Roles, string | undefined>([
    [Roles.APPLICANT, letter.applicantId],
    [Roles.BENEFICIARY, letter.beneficiaryId],
    [Roles.ISSUING_BANK, letter.issuingBankId],
    [Roles.ADVISING_BANK, letter.beneficiaryBankId],
    [Roles.NEGOTIATING_BANK, letter.beneficiaryBankId]
  ])

  Object.values(Roles)
    .filter(r => r !== Roles.NEGOTIATING_BANK)
    .forEach((role: Roles) =>
      // TODO LS we should replace the beneficiaryBankRole with advisingBankId & negotiatingBankId
      it(`returns ${role}`, () => {
        expect(findRole(letter, companyStaticIds.get(role))).toEqual(role)
      })
    )
})

describe('findParticipantCommonNames', () => {
  it('return undefined participants if counterparties not match', () => {
    const letter: ILetterOfCredit = fakeLetterOfCredit()
    const members: IMember[] = []

    expect(findParticipantCommonNames(letter, members)).toEqual({
      applicant: undefined,
      beneficiary: undefined,
      issuingBank: undefined,
      beneficiaryBank: undefined
    })
  })

  it('returns participants names from counterparties', () => {
    const letter: ILetterOfCredit = fakeLetterOfCredit()
    const members: IMember[] = [
      fakeMember({ staticId: letter.applicantId, commonName: 'Applicant' }),
      fakeMember({ staticId: letter.beneficiaryId!, commonName: 'Beneficiary' }),
      fakeMember({ staticId: letter.issuingBankId!, commonName: 'Issuing Bank' }),
      fakeMember({ staticId: letter.beneficiaryBankId!, commonName: 'Beneficiary Bank' })
    ]

    expect(findParticipantCommonNames(letter, members)).toEqual({
      applicant: 'Applicant',
      beneficiary: 'Beneficiary',
      issuingBank: 'Issuing Bank',
      beneficiaryBank: 'Beneficiary Bank'
    })
  })
})
