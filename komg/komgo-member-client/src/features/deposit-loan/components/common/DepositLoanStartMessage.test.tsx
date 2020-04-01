import * as React from 'react'
import * as renderer from 'react-test-renderer'
import { MemoryRouter as Router } from 'react-router-dom'

import DepositLoanStartMessage from './DepositLoanStartMessage'
import { CreditAppetiteDepositLoanFeature } from '../../store/types'

describe('DepositLoanStartMessage', () => {
  const defaultProps = {
    canCrudCreditAppetite: true,
    isFinancialInstitution: true,
    feature: CreditAppetiteDepositLoanFeature.Deposit
  }

  it('should match snapshot for financial institutions and deposit', () => {
    expect(
      renderer
        .create(
          <Router>
            <DepositLoanStartMessage {...defaultProps} />
          </Router>
        )
        .toJSON()
    ).toMatchSnapshot()
  })

  it('should match snapshot for financial institutions and loan', () => {
    expect(
      renderer
        .create(
          <Router>
            <DepositLoanStartMessage {...defaultProps} feature={CreditAppetiteDepositLoanFeature.Loan} />
          </Router>
        )
        .toJSON()
    ).toMatchSnapshot()
  })

  it('should match snapshot for corporate and deposit', () => {
    expect(
      renderer
        .create(
          <Router>
            <DepositLoanStartMessage {...defaultProps} isFinancialInstitution={false} />
          </Router>
        )
        .toJSON()
    ).toMatchSnapshot()
  })

  it('should match snapshot for corporate and deposit', () => {
    expect(
      renderer
        .create(
          <Router>
            <DepositLoanStartMessage
              {...defaultProps}
              feature={CreditAppetiteDepositLoanFeature.Loan}
              isFinancialInstitution={false}
            />
          </Router>
        )
        .toJSON()
    ).toMatchSnapshot()
  })
})
