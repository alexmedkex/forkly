import * as React from 'react'
import { MemoryRouter as Router } from 'react-router-dom'
import * as renderer from 'react-test-renderer'
import { buildFakeStandByLetterOfCreditBase } from '@komgo/types'
import { AgreementView, AgreementViewProps } from './index'
import { fakeCargo, fakeCounterparty, fakeMember, fakeTrade } from '../../../letter-of-credit-legacy/utils/faker'
import { buildFakeCargo, buildFakeTrade } from '@komgo/types/dist'

describe('AgreementView', () => {
  let props: AgreementViewProps

  beforeEach(() => {
    const issuingBankId = 'abc1111'
    const trade = buildFakeTrade()
    const cargo = buildFakeCargo()
    props = {
      letter: buildFakeStandByLetterOfCreditBase({ issuingBankId }),
      applicant: fakeMember(),
      beneficiary: fakeMember(),
      activeFields: [],
      trade,
      cargo,
      issuingBanks: [
        fakeCounterparty({
          staticId: issuingBankId,
          commonName: 'bank1',
          isMember: true,
          isFinancialInstitution: true
        }),
        fakeCounterparty({ staticId: 'abc2222', commonName: 'bank2', isMember: true, isFinancialInstitution: true }),
        fakeCounterparty({ staticId: 'abc3333', commonName: 'bank3', isMember: true, isFinancialInstitution: true })
      ],
      beneficiaryBanks: [
        fakeMember({ staticId: 'abc1111', commonName: 'bank1', isMember: true, isFinancialInstitution: true }),
        fakeMember({ staticId: 'abc2222', commonName: 'bank2', isMember: true, isFinancialInstitution: true }),
        fakeMember({ staticId: 'abc3333', commonName: 'bank3', isMember: true, isFinancialInstitution: true })
      ]
    }
  })

  describe('render', () => {
    describe('read only', () => {
      it('shows values', () => {
        expect(
          renderer
            .create(
              <Router>
                <AgreementView {...props} />
              </Router>
            )
            .toJSON()
        ).toMatchSnapshot()
      })

      it('shows empty issuingBank', () => {
        expect(
          renderer
            .create(
              <Router>
                <AgreementView {...props} issuingBanks={[]} />
              </Router>
            )
            .toJSON()
        ).toMatchSnapshot()
      })
    })

    describe('editing mode', () => {
      it('shows editable fields', () => {
        expect(
          renderer
            .create(
              <Router>
                <AgreementView
                  {...props}
                  activeFields={[
                    'additionalInformation',
                    'overrideStandardTemplate',
                    'duplicateClause',
                    'feesPayableBy',
                    'expiryDate',
                    'amount',
                    'beneficiaryBankId',
                    'issuingBankId',
                    'contractDate',
                    'contractReference'
                  ]}
                />
              </Router>
            )
            .toJSON()
        ).toMatchSnapshot()
      })
    })
  })
})
