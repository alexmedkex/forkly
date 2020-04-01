import * as React from 'react'
import { shallow } from 'enzyme'
import { buildFakeDepositLoan } from '@komgo/types'

import { DepositLoanDashboard } from './DepositLoanDashboard'
import { CreditAppetiteDepositLoanFeature } from '../../store/types'
import DepositsLoansTable from '../../components/financial-institutions/dashboard/DepositsLoansTable'

describe('DepositLoanDashboard', () => {
  let defaultProps
  const deposit1 = buildFakeDepositLoan({ staticId: '123' })

  beforeEach(() => {
    defaultProps = {
      items: [],
      isFetching: false,
      errors: [],
      isAuthorized: jest.fn(() => true),
      fetchDepositsLoans: jest.fn(),
      removeDepositLoan: jest.fn(),
      clearError: jest.fn(),
      removingErrors: [],
      isRemoving: false,
      feature: CreditAppetiteDepositLoanFeature.Deposit
    }
  })

  it('should render successfully', () => {
    const wrapper = shallow(<DepositLoanDashboard {...defaultProps} />)

    expect(wrapper.exists()).toBe(true)
  })

  it('should render empty message and not render table', () => {
    const wrapper = shallow(<DepositLoanDashboard {...defaultProps} />)

    const emptyMessage = wrapper.find('DepositLoanStartMessage')
    const table = wrapper.find(DepositsLoansTable)

    expect(emptyMessage.length).toBe(1)
    expect(table.length).toBe(0)
  })

  it('should render table and not render empty message', () => {
    const wrapper = shallow(<DepositLoanDashboard {...defaultProps} items={[deposit1]} />)

    const emptyMessage = wrapper.find('DepositLoanStartMessage')
    const table = wrapper.find(DepositsLoansTable)

    expect(emptyMessage.length).toBe(0)
    expect(table.length).toBe(1)
  })

  it('should render LoadingTransition and not render ErrorMessage if isFetching is equal to true', () => {
    const wrapper = shallow(<DepositLoanDashboard {...defaultProps} isFetching={true} />)

    const loadingTransition = wrapper.find('LoadingTransition')
    const errorMessage = wrapper.find('ErrorMessage')

    expect(errorMessage.length).toBe(0)
    expect(loadingTransition.length).toBe(1)
  })

  it('should find ErrorMessage and not LoadingTransition', () => {
    const wrapper = shallow(<DepositLoanDashboard {...defaultProps} errors={[{ message: 'Test' }]} />)

    const errorMessage = wrapper.find('ErrorMessage')
    const loadingTransition = wrapper.find('LoadingTransition')

    expect(errorMessage.length).toBe(1)
    expect(loadingTransition.length).toBe(0)
  })

  it('should render unauthorized message', () => {
    const wrapper = shallow(<DepositLoanDashboard {...defaultProps} isAuthorized={jest.fn(() => false)} />)

    const unauthorized = wrapper.find('Unauthorized')

    expect(unauthorized.length).toBe(1)
  })

  it('should set removeDepositLoan in state when handleRemove is called', () => {
    const wrapper = shallow(<DepositLoanDashboard {...defaultProps} />)

    const instance = wrapper.instance() as DepositLoanDashboard

    instance.handleRemove(deposit1 as any)

    expect(wrapper.state('removeDepositLoan')).toEqual(deposit1)
  })

  it('should set undefined for removeDepositLoan in state when handleCloseRemove is called', () => {
    const wrapper = shallow(<DepositLoanDashboard {...defaultProps} />)
    wrapper.setState({ removeDepositLoan: deposit1 })

    const instance = wrapper.instance() as DepositLoanDashboard

    instance.handleCloseRemove()

    expect(wrapper.state('removeCreditLine')).toBeFalsy()
    expect(defaultProps.clearError).not.toHaveBeenCalled()
  })

  it('should reset removing error when handleCloseRemove is called and error exists', () => {
    const wrapper = shallow(<DepositLoanDashboard {...defaultProps} removingErrors={[{ message: 'Test' }]} />)
    wrapper.setState({ removeDepositLoan: deposit1 })

    const instance = wrapper.instance() as DepositLoanDashboard

    instance.handleCloseRemove()

    expect(wrapper.state('removeCreditLine')).toBeFalsy()
    expect(defaultProps.clearError).toHaveBeenCalled()
  })

  it('should call removeDepositLoan when handleConfirmRemove is called', () => {
    const wrapper = shallow(<DepositLoanDashboard {...defaultProps} />)
    wrapper.setState({ removeDepositLoan: deposit1 })

    const instance = wrapper.instance() as DepositLoanDashboard

    instance.handleConfirmRemove()

    expect(defaultProps.removeDepositLoan).toHaveBeenCalled()
  })

  it('should call fetchDepositsLoans when feature is changed', () => {
    const wrapper = shallow(<DepositLoanDashboard {...defaultProps} />)
    wrapper.setProps({ feature: CreditAppetiteDepositLoanFeature.Loan })

    expect(defaultProps.fetchDepositsLoans).toHaveBeenCalledTimes(2)
  })

  it('should pass appropriate props to header component', () => {
    const wrapper = shallow(<DepositLoanDashboard {...defaultProps} />)

    const header = wrapper.find('PageHeader')

    expect(header.prop('headerContent')).toBe('Deposits')
  })
})
