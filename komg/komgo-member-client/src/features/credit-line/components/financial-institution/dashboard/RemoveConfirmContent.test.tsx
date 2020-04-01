import * as React from 'react'
import * as renderer from 'react-test-renderer'
import { buildFakeRiskCover, buildFakeSharedCreditLine } from '@komgo/types'

import RemoveConfirmContent from './RemoveConfirmContent'
import { CreditLineType, IExtendedSharedCreditLine, IExtendedCreditLine } from '../../../store/types'

describe('RemoveConfirmContent', () => {
  const defaultProps = {
    feature: CreditLineType.RiskCover,
    creditLine: {
      ...buildFakeRiskCover(),
      counterpartyName: 'Name',
      counterpartyLocation: 'Location',
      sharedCreditLines: [buildFakeSharedCreditLine() as IExtendedSharedCreditLine]
    } as IExtendedCreditLine
  }

  it('should match snapshot when shared info is empty array', () => {
    expect(
      renderer
        .create(
          <RemoveConfirmContent {...defaultProps} creditLine={{ ...defaultProps.creditLine, sharedCreditLines: [] }} />
        )
        .toJSON()
    ).toMatchSnapshot()
  })

  it('should match snapshot when shared info exists', () => {
    expect(renderer.create(<RemoveConfirmContent {...defaultProps} />).toJSON()).toMatchSnapshot()
  })
})
