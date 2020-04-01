import { Roles } from '../../letter-of-credit-legacy/constants/roles'
import { findRole } from './findRole'
import { buildFakeLetterOfCredit, IDataLetterOfCredit } from '@komgo/types'

describe('findRole', () => {
  const letter = buildFakeLetterOfCredit<IDataLetterOfCredit>()

  const companyStaticIds = new Map<Roles, string | undefined>([
    [Roles.APPLICANT, letter.templateInstance.data.applicant.staticId],
    [Roles.BENEFICIARY, letter.templateInstance.data.beneficiary.staticId],
    [Roles.ISSUING_BANK, letter.templateInstance.data.issuingBank.staticId]
  ])

  Object.values(Roles)
    .filter(role => role !== Roles.NEGOTIATING_BANK && role !== Roles.ADVISING_BANK)
    .forEach((role: Roles) =>
      // TODO LS we should replace the beneficiaryBankRole with advisingBankId & negotiatingBankId
      it(`returns ${role}`, () => {
        expect(findRole(letter, companyStaticIds.get(role))).toEqual(role)
      })
    )
})
