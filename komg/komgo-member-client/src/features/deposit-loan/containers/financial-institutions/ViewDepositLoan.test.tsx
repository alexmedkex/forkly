import * as React from 'react'
import { buildFakeDepositLoan, DepositLoanType } from '@komgo/types'
import { shallow } from 'enzyme'
import * as renderer from 'react-test-renderer'
import { MemoryRouter as Router } from 'react-router-dom'

import { ViewDepositLoan } from './ViewDepositLoan'
import { CreditAppetiteDepositLoanFeature } from '../../store/types'
import moment from 'moment'

describe('ViewDepositLoan', () => {
  let defaultProps
  const deposit1 = buildFakeDepositLoan({ staticId: '123' })

  beforeEach(() => {
    moment.tz.guess = jest.fn(() => 'UTC')
    moment.tz.setDefault('UTC')

    defaultProps = {
      depositLoan: deposit1,
      id: '123',
      isFetching: false,
      errors: [],
      isAuthorized: jest.fn(() => true),
      feature: CreditAppetiteDepositLoanFeature.Deposit,
      getDepositLoan: jest.fn(),
      fetchConnectedCounterpartiesAsync: jest.fn()
    }
  })

  it('should render succussfully', () => {
    const wrapper = shallow(<ViewDepositLoan {...defaultProps} />)

    expect(wrapper.exists()).toBe(true)
  })

  it('should render fetching component and not render error message or data', () => {
    const wrapper = shallow(<ViewDepositLoan {...defaultProps} isFetching={true} />)

    const loadingTransition = wrapper.find('LoadingTransition')
    const errorMessage = wrapper.find('ErrorMessage')
    const data = wrapper.find('ViewDepositLoanWrapper')

    expect(errorMessage.length).toBe(0)
    expect(data.length).toBe(0)
    expect(loadingTransition.length).toBe(1)
  })

  it('should render error message and not render fetching component or data', () => {
    const wrapper = shallow(<ViewDepositLoan {...defaultProps} errors={[{ message: 'Error' }]} />)

    const loadingTransition = wrapper.find('LoadingTransition')
    const errorMessage = wrapper.find('ErrorMessage')
    const data = wrapper.find('ViewDepositLoanWrapper')

    expect(errorMessage.length).toBe(1)
    expect(data.length).toBe(0)
    expect(loadingTransition.length).toBe(0)
  })

  it('should render data and not render error message or fethicng commponent', () => {
    const wrapper = shallow(<ViewDepositLoan {...defaultProps} />)

    const loadingTransition = wrapper.find('LoadingTransition')
    const errorMessage = wrapper.find('ErrorMessage')
    const data = wrapper.find('ViewDepositLoanWrapper')

    expect(errorMessage.length).toBe(0)
    expect(data.length).toBe(1)
    expect(loadingTransition.length).toBe(0)
  })

  it('should render appropriate header', () => {
    const wrapper = shallow(<ViewDepositLoan {...defaultProps} />)

    const h1 = wrapper.find('h1')

    expect(h1.text()).toBe('USD 3 months')
  })

  it('should call getDepositLoan when feature is changed', () => {
    const wrapper = shallow(<ViewDepositLoan {...defaultProps} />)
    wrapper.setProps({ feature: CreditAppetiteDepositLoanFeature.Loan })

    expect(defaultProps.getDepositLoan).toHaveBeenCalledTimes(2)
  })

  it('should call getDepositLoan when id is changed', () => {
    const wrapper = shallow(<ViewDepositLoan {...defaultProps} />)
    wrapper.setProps({ id: '1111' })

    expect(defaultProps.getDepositLoan).toHaveBeenCalledTimes(2)
  })

  it('should match snapshot for deposit', () => {
    const wrapper = renderer.create(
      <Router>
        <ViewDepositLoan {...defaultProps} />
      </Router>
    )

    expect(wrapper.toJSON()).toMatchSnapshot()
  })

  it('should match snapshot for loan', () => {
    const loan = buildFakeDepositLoan({ type: DepositLoanType.Loan })
    const wrapper = renderer.create(
      <Router>
        <ViewDepositLoan {...defaultProps} depositLoan={loan} />
      </Router>
    )

    expect(wrapper.toJSON()).toMatchSnapshot()
  })
})
