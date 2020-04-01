import * as React from 'react'
import { shallow } from 'enzyme'
import { DisclosedCreditLineSummaryDashboard } from './DisclosedCreditLineSummaryDashboard'
import DisclosedCreditLinesSummaryTable from '../../components/corporate/dashboard/DisclosedCreditLinesSummaryTable'
import { Products } from '../../../document-management/constants/Products'
import { SubProducts } from '../../../document-management/constants/SubProducts'
import { CreditLineType } from '../../store/types'

const fakeDisclosedInfoEnriched = {
  counterpartyStaticId: '123',
  lowestFee: 2,
  availabilityCount: 3,
  appetiteCount: 4,
  _id: '11',
  counterpartyName: 'Test1'
}

describe('DisclosedCreditLineSummaryDashboard', () => {
  let defaultProps

  beforeEach(() => {
    defaultProps = {
      disclosedCreditLineSummaries: [],
      isFetching: false,
      errors: [],
      isAuthorized: jest.fn(() => true),
      fetchDisclosedCreditLineSummaries: jest.fn(),
      productId: Products.TradeFinance,
      subProductId: SubProducts.ReceivableDiscounting,
      feature: CreditLineType.RiskCover
    }
  })

  it('should render component successfully', () => {
    const wrapper = shallow(<DisclosedCreditLineSummaryDashboard {...defaultProps} />)

    expect(wrapper.exists()).toBe(true)
  })

  it('should find message-empty buyers when there are not any buyers set yet and not find table with buyers', () => {
    const wrapper = shallow(<DisclosedCreditLineSummaryDashboard {...defaultProps} />)

    const message = wrapper.find('CreditLineStartMessage')
    const table = wrapper.find(DisclosedCreditLinesSummaryTable)

    expect(message.length).toBe(1)
    expect(table.length).toBe(0)
  })

  it('should find table with buyers and not find message-empty buyers when there are buyers', () => {
    const wrapper = shallow(
      <DisclosedCreditLineSummaryDashboard
        {...defaultProps}
        disclosedCreditLineSummaries={[fakeDisclosedInfoEnriched]}
      />
    )

    const message = wrapper.find('CreditLineStartMessage')
    const table = wrapper.find(DisclosedCreditLinesSummaryTable)

    expect(message.length).toBe(0)
    expect(table.length).toBe(1)
  })

  it('should find LoadingTransition and not find ErrorMessage if isFetching is equal to true', () => {
    const wrapper = shallow(<DisclosedCreditLineSummaryDashboard {...defaultProps} isFetching={true} />)

    const loadingTransition = wrapper.find('LoadingTransition')
    const errorMessage = wrapper.find('ErrorMessage')

    expect(errorMessage.length).toBe(0)
    expect(loadingTransition.length).toBe(1)
  })

  it('should find LoadingTransition and not find ErrorMessage if isFetching is equal to true and errors is not empty array', () => {
    const wrapper = shallow(
      <DisclosedCreditLineSummaryDashboard {...defaultProps} isFetching={true} errors={[{ message: 'Test' }]} />
    )

    const loadingTransition = wrapper.find('LoadingTransition')
    const errorMessage = wrapper.find('ErrorMessage')

    expect(errorMessage.length).toBe(0)
    expect(loadingTransition.length).toBe(1)
  })

  it('should find ErrorMessage and not LoadingTransition', () => {
    const wrapper = shallow(<DisclosedCreditLineSummaryDashboard {...defaultProps} errors={[{ message: 'Test' }]} />)

    const errorMessage = wrapper.find('ErrorMessage')
    const loadingTransition = wrapper.find('LoadingTransition')

    expect(errorMessage.length).toBe(1)
    expect(loadingTransition.length).toBe(0)
  })

  it('should render unauthorized message', () => {
    const wrapper = shallow(
      <DisclosedCreditLineSummaryDashboard {...defaultProps} isAuthorized={jest.fn(() => false)} />
    )

    const unauthorized = wrapper.find('Unauthorized')

    expect(unauthorized.length).toBe(1)
  })
})
