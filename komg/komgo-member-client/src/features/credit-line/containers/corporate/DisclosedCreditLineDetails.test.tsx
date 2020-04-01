import * as React from 'react'
import { shallow } from 'enzyme'
import { buildFakeCreditLine } from '@komgo/types'
import { DisclosedCreditLineDetails } from './DisclosedCreditLineDetails'
import DisclosedCreditLinesForBuyerTable from '../../components/corporate/details/DisclosedCreditLinesForCounterpartyTable'
import { Products } from '../../../document-management/constants/Products'
import { SubProducts } from '../../../document-management/constants/SubProducts'
import { CreditLineType } from '../../store/types'

const fakeDisclosedCreditLinesEnriched = {
  ...buildFakeCreditLine(),
  counterpartyName: 'Test1'
}

describe('DisclosedCreditLineSummaryDashboard', () => {
  let defaultProps

  beforeEach(() => {
    defaultProps = {
      disclosedCreditLines: [fakeDisclosedCreditLinesEnriched],
      isFetching: false,
      errors: [],
      isAuthorized: jest.fn(() => true),
      id: '1',
      location: {
        state: undefined
      },
      history: {
        replace: jest.fn()
      },
      fetchDisclosedCreditLines: jest.fn(),
      productId: Products.TradeFinance,
      subProductId: SubProducts.ReceivableDiscounting,
      feature: CreditLineType.RiskCover
    }
  })

  it('should render component successfully', () => {
    const wrapper = shallow(<DisclosedCreditLineDetails {...defaultProps} />)

    expect(wrapper.exists()).toBe(true)
  })

  it('should call fetchDisclosedCreditLines with id', () => {
    const wrapper = shallow(<DisclosedCreditLineDetails {...defaultProps} />)

    expect(defaultProps.fetchDisclosedCreditLines).toHaveBeenCalledWith('tradeFinance', 'rd', '1')
  })

  it('should find table with banks data', () => {
    const wrapper = shallow(<DisclosedCreditLineDetails {...defaultProps} />)

    const table = wrapper.find(DisclosedCreditLinesForBuyerTable)

    expect(table.length).toBe(1)
  })

  it('should find LoadingTransition and not find ErrorMessage if isFetching is equal to true', () => {
    const wrapper = shallow(<DisclosedCreditLineDetails {...defaultProps} isFetching={true} />)

    const loadingTransition = wrapper.find('LoadingTransition')
    const errorMessage = wrapper.find('ErrorMessage')

    expect(errorMessage.length).toBe(0)
    expect(loadingTransition.length).toBe(1)
  })

  it('should find LoadingTransition and not find ErrorMessage if isFetching is equal to true and errors is not empty array', () => {
    const wrapper = shallow(
      <DisclosedCreditLineDetails {...defaultProps} isFetching={true} errors={[{ message: 'Test' }]} />
    )

    const loadingTransition = wrapper.find('LoadingTransition')
    const errorMessage = wrapper.find('ErrorMessage')

    expect(errorMessage.length).toBe(0)
    expect(loadingTransition.length).toBe(1)
  })

  it('should find ErrorMessage and not LoadingTransition', () => {
    const wrapper = shallow(<DisclosedCreditLineDetails {...defaultProps} errors={[{ message: 'Test' }]} />)

    const errorMessage = wrapper.find('ErrorMessage')
    const loadingTransition = wrapper.find('LoadingTransition')

    expect(errorMessage.length).toBe(1)
    expect(loadingTransition.length).toBe(0)
  })

  it('should render unauthorized message', () => {
    const wrapper = shallow(<DisclosedCreditLineDetails {...defaultProps} isAuthorized={jest.fn(() => false)} />)

    const unauthorized = wrapper.find('Unauthorized')

    expect(unauthorized.length).toBe(1)
  })

  it('should set in state if location state exists', () => {
    const location = { state: { highlightBank: '123' } }
    const wrapper = shallow(<DisclosedCreditLineDetails {...defaultProps} location={location} />)

    expect(wrapper.state('highlightBank')).toBe('123')
  })

  it('should reset location state if highlightBank exists in location state', () => {
    const location = { state: { highlightBank: '123' } }
    const wrapper = shallow(<DisclosedCreditLineDetails {...defaultProps} location={location} />)

    expect(defaultProps.history.replace).toHaveBeenCalled()
  })
})
