import * as React from 'react'
import { shallow } from 'enzyme'
import { buildFakeDisclosedDepositLoan, Currency, DepositLoanPeriod } from '@komgo/types'

import { CreditAppetiteDepositLoanFeature, IExtendedDisclosedDepositLoan } from '../../store/types'
import { DepositLoanCurrencyAndTenorDetails } from './DepositLoanCurrencyAndTenorDetails'
import DisclosedDepositLoanDetailsTable from '../../components/corporate/details/DisclosedDepositLoanDetailsTable'

describe('DepositLoanCurrencyAndTenorDetails', () => {
  let defaultProps

  const fakeDisclosedDepositLoanEnriched: IExtendedDisclosedDepositLoan = {
    ...buildFakeDisclosedDepositLoan(),
    companyName: 'SC',
    companyLocation: 'Paris'
  }

  beforeEach(() => {
    defaultProps = {
      items: [],
      isFetching: false,
      errors: [],
      isAuthorized: jest.fn(() => true),
      feature: CreditAppetiteDepositLoanFeature.Deposit,
      params: { currency: Currency.EUR, period: DepositLoanPeriod.Months, periodDuration: 3 },
      location: {
        state: undefined
      },
      history: {
        replace: jest.fn()
      },
      fetchDisclosedDepositsLoans: jest.fn(),
      fetchConnectedCounterpartiesAsync: jest.fn()
    }
  })

  it('should render component successfully', () => {
    const wrapper = shallow(<DepositLoanCurrencyAndTenorDetails {...defaultProps} />)

    expect(wrapper.exists()).toBe(true)
  })

  it('should find table when items are loaded', () => {
    const wrapper = shallow(
      <DepositLoanCurrencyAndTenorDetails {...defaultProps} items={[fakeDisclosedDepositLoanEnriched]} />
    )

    const table = wrapper.find(DisclosedDepositLoanDetailsTable)

    expect(table.length).toBe(1)
  })

  it('should find LoadingTransition and not find ErrorMessage if isFetching is equal to true', () => {
    const wrapper = shallow(<DepositLoanCurrencyAndTenorDetails {...defaultProps} isFetching={true} />)

    const loadingTransition = wrapper.find('LoadingTransition')
    const errorMessage = wrapper.find('ErrorMessage')

    expect(errorMessage.length).toBe(0)
    expect(loadingTransition.length).toBe(1)
  })

  it('should find LoadingTransition and not find ErrorMessage if isFetching is equal to true and errors is not empty array', () => {
    const wrapper = shallow(
      <DepositLoanCurrencyAndTenorDetails {...defaultProps} isFetching={true} errors={[{ message: 'Test' }]} />
    )

    const loadingTransition = wrapper.find('LoadingTransition')
    const errorMessage = wrapper.find('ErrorMessage')

    expect(errorMessage.length).toBe(0)
    expect(loadingTransition.length).toBe(1)
  })

  it('should find ErrorMessage and not LoadingTransition', () => {
    const wrapper = shallow(<DepositLoanCurrencyAndTenorDetails {...defaultProps} errors={[{ message: 'Test' }]} />)

    const errorMessage = wrapper.find('ErrorMessage')
    const loadingTransition = wrapper.find('LoadingTransition')

    expect(errorMessage.length).toBe(1)
    expect(loadingTransition.length).toBe(0)
  })

  it('should render unauthorized message', () => {
    const wrapper = shallow(
      <DepositLoanCurrencyAndTenorDetails {...defaultProps} isAuthorized={jest.fn(() => false)} />
    )

    const unauthorized = wrapper.find('Unauthorized')

    expect(unauthorized.length).toBe(1)
  })

  it('should find warning if there are not any item, that is only possible if someone change url', () => {
    const wrapper = shallow(<DepositLoanCurrencyAndTenorDetails {...defaultProps} />)

    const emptyMessage = wrapper.find('[data-test-id="warning-empty-deposit-loan"]')

    expect(emptyMessage.exists()).toBe(true)
  })

  it('should set in state highlightItem if highlightItem exists in location state', () => {
    const location = { state: { highlightItem: '12345' } }
    const wrapper = shallow(<DepositLoanCurrencyAndTenorDetails {...defaultProps} location={location} />)

    expect(wrapper.state('highlightItem')).toBe('12345')
    expect(defaultProps.history.replace).toHaveBeenCalled()
  })

  it('should set in state highlightItem if props are updated with new locaton.state', () => {
    const location = { state: { highlightItem: '12345' } }
    const wrapper = shallow(<DepositLoanCurrencyAndTenorDetails {...defaultProps} />)

    wrapper.setProps({ location })

    expect(wrapper.state('highlightItem')).toBe('12345')
    expect(defaultProps.history.replace).toHaveBeenCalled()
  })
})
