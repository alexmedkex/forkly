import {
  buildFakeReceivablesDiscountingInfo,
  FinancialInstrument,
  SupportingInstrument,
  RequestType,
  DiscountingType
} from '@komgo/types'
import React from 'react'
import renderer from 'react-test-renderer'
import { DiscountingRequestInfoPane, IDiscountingRequestInfoPaneProps } from './DiscountingRequestInfoPane'

describe('DiscountingRequestInfoPane', () => {
  let testProps: IDiscountingRequestInfoPaneProps

  beforeEach(() => {
    testProps = {
      discountingRequest: buildFakeReceivablesDiscountingInfo()
    }
  })

  it('renders correctly', () => {
    const rd = testProps.discountingRequest.rd
    rd.comment = 'A comment for the RD'
    rd.supportingInstruments = [
      SupportingInstrument.FinancialInstrument,
      SupportingInstrument.CreditInsurance,
      SupportingInstrument.PaymentUndertaking
    ]
    rd.financialInstrumentInfo = {
      financialInstrument: FinancialInstrument.Other,
      financialInstrumentIssuerName: 'FI Issuer name',
      financialInstrumentIfOther: 'Other guy'
    }
    rd.guarantor = 'FI Guarantor'

    expect(renderer.create(<DiscountingRequestInfoPane {...testProps} />).toJSON()).toMatchSnapshot()
  })

  it('renders correctly Discounting blended', () => {
    const rd = testProps.discountingRequest.rd
    rd.requestType = RequestType.Discount
    rd.discountingType = DiscountingType.Blended
    rd.riskCoverDate = '2019/09/09'
    rd.numberOfDaysRiskCover = 20
    rd.discountingDate = '2019/09/06'
    rd.numberOfDaysDiscounting = 21

    expect(renderer.create(<DiscountingRequestInfoPane {...testProps} />).toJSON()).toMatchSnapshot()
  })

  it('renders correctly Discounting with recourse', () => {
    const rd = testProps.discountingRequest.rd
    rd.requestType = RequestType.Discount
    rd.discountingType = DiscountingType.Recourse
    rd.discountingDate = '2019/09/05'
    rd.numberOfDaysDiscounting = 21

    expect(renderer.create(<DiscountingRequestInfoPane {...testProps} />).toJSON()).toMatchSnapshot()
  })

  it('renders correctly Risk Cover with discounting option', () => {
    const rd = testProps.discountingRequest.rd
    rd.requestType = RequestType.RiskCoverDiscounting
    rd.riskCoverDate = '2019/09/04'
    rd.numberOfDaysRiskCover = 20
    rd.discountingDate = '2019/09/03'
    rd.numberOfDaysDiscounting = 21

    expect(renderer.create(<DiscountingRequestInfoPane {...testProps} />).toJSON()).toMatchSnapshot()
  })

  it('renders correctly Risk Cover only', () => {
    const rd = testProps.discountingRequest.rd
    rd.requestType = RequestType.RiskCover
    rd.riskCoverDate = '2019/09/02'
    rd.numberOfDaysRiskCover = 20

    expect(renderer.create(<DiscountingRequestInfoPane {...testProps} />).toJSON()).toMatchSnapshot()
  })
})
