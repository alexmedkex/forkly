import {
  buildFakeReceivablesDiscountingInfo,
  FinancialInstrument,
  SupportingInstrument,
  RequestType,
  DiscountingType
} from '@komgo/types'
import { shallow } from 'enzyme'
import React from 'react'
import renderer from 'react-test-renderer'
import { StyledLabel } from '../fields/DiscountingRequestInfoField'
import { DiscountingRequestInfo, IDiscountingRequestInfoProps } from './DiscountingRequestInfo'
import { HistoryWrapper } from '../tooltips/HistoryWrapper'

describe('DiscountingRequestInfo', () => {
  let testProps: IDiscountingRequestInfoProps

  beforeEach(() => {
    testProps = {
      discountingRequest: buildFakeReceivablesDiscountingInfo(),
      history: {}
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

    expect(renderer.create(<DiscountingRequestInfo {...testProps} />).toJSON()).toMatchSnapshot()
  })

  it('renders correctly Discounting blended', () => {
    const rd = testProps.discountingRequest.rd
    rd.requestType = RequestType.Discount
    rd.discountingType = DiscountingType.Blended
    rd.riskCoverDate = '2019/09/09'
    rd.numberOfDaysRiskCover = 20
    rd.discountingDate = '2019/09/06'
    rd.numberOfDaysDiscounting = 21

    expect(renderer.create(<DiscountingRequestInfo {...testProps} />).toJSON()).toMatchSnapshot()
  })

  it('renders correctly Discounting with recourse', () => {
    const rd = testProps.discountingRequest.rd
    rd.requestType = RequestType.Discount
    rd.discountingType = DiscountingType.Recourse
    rd.discountingDate = '2019/09/05'
    rd.numberOfDaysDiscounting = 21

    expect(renderer.create(<DiscountingRequestInfo {...testProps} />).toJSON()).toMatchSnapshot()
  })

  it('renders correctly Risk Cover with discounting option', () => {
    const rd = testProps.discountingRequest.rd
    rd.requestType = RequestType.RiskCoverDiscounting
    rd.riskCoverDate = '2019/09/04'
    rd.numberOfDaysRiskCover = 20
    rd.discountingDate = '2019/09/03'
    rd.numberOfDaysDiscounting = 21

    expect(renderer.create(<DiscountingRequestInfo {...testProps} />).toJSON()).toMatchSnapshot()
  })

  it('renders correctly Risk Cover only', () => {
    const rd = testProps.discountingRequest.rd
    rd.requestType = RequestType.RiskCover
    rd.riskCoverDate = '2019/09/02'
    rd.numberOfDaysRiskCover = 20

    expect(renderer.create(<DiscountingRequestInfo {...testProps} />).toJSON()).toMatchSnapshot()
  })

  it('displays Title transfer date always', () => {
    const props = { ...testProps }

    const wrapper = shallow(<DiscountingRequestInfo {...props} />)
    const label = wrapper
      .find('[fieldName="dateOfPerformance"]')
      .at(0)
      .shallow()
      .find(StyledLabel)

    expect(label.props().children).toEqual('Title transfer date')
  })

  it('tooltip renders for the right fields', () => {
    const wrapper = shallow(
      <DiscountingRequestInfo
        {...testProps}
        history={{
          historyEntry: {
            invoiceAmount: [
              { updatedAt: '2019-05-19T13:00:00Z', value: 1000 },
              { updatedAt: '2019-05-20T14:00:00Z', value: 1100 }
            ]
          }
        }}
      />
    )
    const popupElementByField = field =>
      wrapper
        .find(`[fieldName="${field}"]`)
        .dive()
        .find(HistoryWrapper)

    expect(popupElementByField('invoiceAmount').exists()).toBeTruthy()
    expect(popupElementByField('dateOfPerformance').exists()).toBeFalsy()
  })
})
