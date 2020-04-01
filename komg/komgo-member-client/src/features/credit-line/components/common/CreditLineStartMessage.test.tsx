import * as React from 'react'
import renderer from 'react-test-renderer'
import { MemoryRouter as Router } from 'react-router-dom'

import CreditLineStartMessage from './CreditLineStartMessage'
import { CreditLineType } from '../../store/types'
import { fakeMember } from '../../../letter-of-credit-legacy/utils/faker'

const withModalProps = {
  members: [{ ...fakeMember({ country: 'RS' }), disabled: false }],
  title: 'Select a buyer',
  counterpartyTablePrint: 'Buyer',
  onNext: jest.fn()
}

describe('CreditLineStartMessage', () => {
  it('should match snapshot', () => {
    expect(
      renderer
        .create(
          <Router>
            <CreditLineStartMessage
              canCrudRiskCover={true}
              isFinancialInstitution={true}
              feature={CreditLineType.RiskCover}
              withModalProps={withModalProps}
            />
          </Router>
        )
        .toJSON()
    ).toMatchSnapshot()
  })
  it('should match snapshot when user is coporate', () => {
    expect(
      renderer
        .create(
          <Router>
            <CreditLineStartMessage
              canCrudRiskCover={true}
              isFinancialInstitution={false}
              feature={CreditLineType.RiskCover}
              withModalProps={withModalProps}
            />
          </Router>
        )
        .toJSON()
    ).toMatchSnapshot()
  })
  it('should match snapshot for bank lines', () => {
    expect(
      renderer
        .create(
          <Router>
            <CreditLineStartMessage
              canCrudRiskCover={true}
              isFinancialInstitution={true}
              feature={CreditLineType.BankLine}
              withModalProps={withModalProps}
            />
          </Router>
        )
        .toJSON()
    ).toMatchSnapshot()
  })
  it('should match snapshot for bank lines and corporate', () => {
    expect(
      renderer
        .create(
          <Router>
            <CreditLineStartMessage
              canCrudRiskCover={true}
              isFinancialInstitution={false}
              feature={CreditLineType.BankLine}
              withModalProps={withModalProps}
            />
          </Router>
        )
        .toJSON()
    ).toMatchSnapshot()
  })
})
