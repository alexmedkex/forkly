import * as React from 'react'
import { shallow } from 'enzyme'
import { buildFakeDisclosedDepositLoanSummary } from '@komgo/types'

import { IExtendedDisclosedDepositLoanSummary, CreditAppetiteDepositLoanFeature } from '../../store/types'
import { DepositLoanSummariesDashboard } from './DepositLoanSummariesDashboard'
import DisclosedDepositLoanSummariesTable from '../../components/corporate/dashboard/DisclosedDepositLoanSummariesTable'

describe('DisclosedCreditLineSummaryDashboard', () => {
  let defaultProps

  const fakeDisclosedSummaryEnriched: IExtendedDisclosedDepositLoanSummary = {
    ...buildFakeDisclosedDepositLoanSummary(),
    currencyAndTenor: 'USD 3 mounts'
  }

  beforeEach(() => {
    defaultProps = {
      summaries: [],
      isFetching: false,
      errors: [],
      isAuthorized: jest.fn(() => true),
      feature: CreditAppetiteDepositLoanFeature.Deposit,
      fetchDisclosedSummaries: jest.fn()
    }
  })

  it('should render component successfully', () => {
    const wrapper = shallow(<DepositLoanSummariesDashboard {...defaultProps} />)

    expect(wrapper.exists()).toBe(true)
  })

  it('should find empty message when summary is empty array', () => {
    const wrapper = shallow(<DepositLoanSummariesDashboard {...defaultProps} />)

    const message = wrapper.find('DepositLoanStartMessage')
    const table = wrapper.find(DisclosedDepositLoanSummariesTable)

    expect(message.length).toBe(1)
    expect(table.length).toBe(0)
  })

  it('should find table when summary is not empty array', () => {
    const wrapper = shallow(
      <DepositLoanSummariesDashboard {...defaultProps} summaries={[fakeDisclosedSummaryEnriched]} />
    )

    const message = wrapper.find('DepositLoanStartMessage')
    const table = wrapper.find(DisclosedDepositLoanSummariesTable)

    expect(message.length).toBe(0)
    expect(table.length).toBe(1)
  })

  it('should find LoadingTransition and not find ErrorMessage if isFetching is equal to true', () => {
    const wrapper = shallow(<DepositLoanSummariesDashboard {...defaultProps} isFetching={true} />)

    const loadingTransition = wrapper.find('LoadingTransition')
    const errorMessage = wrapper.find('ErrorMessage')

    expect(errorMessage.length).toBe(0)
    expect(loadingTransition.length).toBe(1)
  })

  it('should find LoadingTransition and not find ErrorMessage if isFetching is equal to true and errors is not empty array', () => {
    const wrapper = shallow(
      <DepositLoanSummariesDashboard {...defaultProps} isFetching={true} errors={[{ message: 'Test' }]} />
    )

    const loadingTransition = wrapper.find('LoadingTransition')
    const errorMessage = wrapper.find('ErrorMessage')

    expect(errorMessage.length).toBe(0)
    expect(loadingTransition.length).toBe(1)
  })

  it('should find ErrorMessage and not LoadingTransition', () => {
    const wrapper = shallow(<DepositLoanSummariesDashboard {...defaultProps} errors={[{ message: 'Test' }]} />)

    const errorMessage = wrapper.find('ErrorMessage')
    const loadingTransition = wrapper.find('LoadingTransition')

    expect(errorMessage.length).toBe(1)
    expect(loadingTransition.length).toBe(0)
  })

  it('should render unauthorized message', () => {
    const wrapper = shallow(<DepositLoanSummariesDashboard {...defaultProps} isAuthorized={jest.fn(() => false)} />)

    const unauthorized = wrapper.find('Unauthorized')

    expect(unauthorized.length).toBe(1)
  })
})
