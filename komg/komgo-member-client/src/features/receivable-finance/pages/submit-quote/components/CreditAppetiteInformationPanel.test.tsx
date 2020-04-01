import React from 'react'
import { render } from '@testing-library/react'
import { buildFakeRiskCoverData, buildFakeSharedCreditLine, buildFakeCreditLine } from '@komgo/types'
import moment from 'moment-timezone'
import { ICreditAppetiteInformationPanelProps, CreditAppetiteInformationPanel } from './CreditAppetiteInformationPanel'
import { IExtendedCreditLine } from '../../../../credit-line/store/types'

describe('CreditAppetiteInformationPanel', () => {
  let testProps: ICreditAppetiteInformationPanelProps

  beforeEach(() => {
    moment.tz.guess = jest.fn(() => 'Europe/Belgrade')
    moment.tz.setDefault('Europe/Belgrade')

    const extendedCreditLine: IExtendedCreditLine = {
      ...buildFakeCreditLine(),
      counterpartyName: 'BP',
      counterpartyLocation: '',
      data: buildFakeRiskCoverData(),
      sharedCreditLines: [{ ...buildFakeSharedCreditLine(), counterpartyName: '' }]
    }

    testProps = {
      creditLine: extendedCreditLine,
      sellerStaticId: 'sellerStaticId',
      buyerName: 'Mr. Buyer',
      sellerName: 'Ms. Seller'
    }
  })

  it('should render correctly only Buyer information', () => {
    expect(render(<CreditAppetiteInformationPanel {...testProps} />).asFragment()).toMatchSnapshot()
  })

  it('should render correctly no credit information', () => {
    testProps.creditLine = undefined

    expect(render(<CreditAppetiteInformationPanel {...testProps} />).asFragment()).toMatchSnapshot()
  })

  it('should render correctly Buyer and Seller information', () => {
    testProps.creditLine.sharedCreditLines[0].sharedWithStaticId = testProps.sellerStaticId

    expect(render(<CreditAppetiteInformationPanel {...testProps} />).asFragment()).toMatchSnapshot()
  })
})
