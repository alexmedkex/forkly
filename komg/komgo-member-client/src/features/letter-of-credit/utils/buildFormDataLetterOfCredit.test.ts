import { buildFormDataLetterOfCredit } from './buildFormDataLetterOfCredit'
import { buildFakeCargo, buildFakeTrade } from '@komgo/types'
import { fromJS } from 'immutable'
import { fakeMember } from '../../letter-of-credit-legacy/utils/faker'

describe('buildFormDataLetterOfCredit', () => {
  it('creates amount 0 if an amount related field is 0', () => {
    const cargo = buildFakeCargo()
    const trade = fromJS({ ...buildFakeTrade({ version: 2 }), price: null })
    const applicant = fakeMember({ staticId: 'applicant' })
    const beneficiary = fakeMember({ staticId: 'beneficiary' })

    const dataLc = buildFormDataLetterOfCredit({ cargo, trade, applicant, beneficiary })

    expect(dataLc.amount).toEqual(0)
  })
})
