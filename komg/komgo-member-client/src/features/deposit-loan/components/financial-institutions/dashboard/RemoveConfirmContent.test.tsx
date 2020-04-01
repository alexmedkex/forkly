import * as React from 'react'
import * as renderer from 'react-test-renderer'
import { IDepositLoanResponse, buildFakeDepositLoan, buildFakeShareDepositLoan } from '@komgo/types'

import RemoveConfirmContent from './RemoveConfirmContent'

describe('RemoveConfirmContent', () => {
  const fakeDepositLoanResponse: IDepositLoanResponse = {
    ...buildFakeDepositLoan(),
    sharedWith: [buildFakeShareDepositLoan()]
  }

  it('should match snapshot when shared info is empty array', () => {
    expect(
      renderer.create(<RemoveConfirmContent depoistLoan={{ ...fakeDepositLoanResponse, sharedWith: [] }} />).toJSON()
    ).toMatchSnapshot()
  })

  it('should match snapshot when shared info exists', () => {
    expect(renderer.create(<RemoveConfirmContent depoistLoan={fakeDepositLoanResponse} />).toJSON()).toMatchSnapshot()
  })
})
