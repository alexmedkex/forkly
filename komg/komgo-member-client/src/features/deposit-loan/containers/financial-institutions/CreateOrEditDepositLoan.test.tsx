import * as React from 'react'
import { shallow } from 'enzyme'

import { CreateOrEditDepositLoan } from './CreateOrEditDepositLoan'
import { CreditAppetiteDepositLoanFeature } from '../../store/types'
import { buildFakeDepositLoanResponse, Currency, DepositLoanPeriod } from '@komgo/types'

describe('CreateOrEditDepositLoan', () => {
  let defaultProps

  const deposit1 = buildFakeDepositLoanResponse({ staticId: '123' })
  const deposit2 = buildFakeDepositLoanResponse({
    staticId: '1234',
    currency: Currency.USD,
    period: DepositLoanPeriod.Months
  })

  beforeEach(() => {
    defaultProps = {
      id: undefined,
      depositLoan: undefined,
      depositsLoans: [],
      requests: [],
      counterparties: [],
      isSubmitting: false,
      submittingErrors: [],
      isFetching: false,
      errors: [],
      feature: CreditAppetiteDepositLoanFeature.Deposit,
      getDepositLoan: jest.fn(),
      fetchConnectedCounterpartiesAsync: jest.fn(),
      fetchDepositsLoans: jest.fn(),
      fetchRequests: jest.fn(),
      createDepositLoan: jest.fn(),
      editDepositLoan: jest.fn(),
      clearError: jest.fn(),
      isAuthorized: jest.fn(() => true),
      history: {
        goBack: jest.fn()
      }
    }
  })

  it('should render component successfully', () => {
    const wrapper = shallow(<CreateOrEditDepositLoan {...defaultProps} />)

    expect(wrapper.exists()).toBe(true)
  })

  it('should call approprirate api functions', () => {
    const wrapper = shallow(<CreateOrEditDepositLoan {...defaultProps} />)

    expect(defaultProps.getDepositLoan).not.toHaveBeenCalled()
    expect(defaultProps.fetchConnectedCounterpartiesAsync).toHaveBeenCalled()
    expect(defaultProps.fetchDepositsLoans).toHaveBeenCalled()
  })

  it('should call getDepositLoan when id exists', () => {
    const wrapper = shallow(<CreateOrEditDepositLoan {...defaultProps} id="123" />)

    expect(defaultProps.getDepositLoan).toHaveBeenCalled()
  })

  it('should call api when feature is changed', () => {
    const wrapper = shallow(<CreateOrEditDepositLoan {...defaultProps} />)
    wrapper.setProps({ feature: CreditAppetiteDepositLoanFeature.Loan })

    expect(defaultProps.fetchDepositsLoans).toHaveBeenCalledTimes(2)
  })

  it('should call getDepositLoan when id is changed', () => {
    const wrapper = shallow(<CreateOrEditDepositLoan {...defaultProps} />)
    wrapper.setProps({ id: '1111' })

    expect(defaultProps.fetchDepositsLoans).toHaveBeenCalledTimes(2)
  })

  it('should render LoadingTransition and not render ErrorMessage if isFetching is equal to true', () => {
    const wrapper = shallow(<CreateOrEditDepositLoan {...defaultProps} isFetching={true} />)

    const loadingTransition = wrapper.find('LoadingTransition')
    const errorMessage = wrapper.find('ErrorMessage')

    expect(errorMessage.length).toBe(0)
    expect(loadingTransition.length).toBe(1)
  })

  it('should find ErrorMessage and not LoadingTransition', () => {
    const wrapper = shallow(<CreateOrEditDepositLoan {...defaultProps} errors={[{ message: 'Test' }]} />)

    const errorMessage = wrapper.find('ErrorMessage')
    const loadingTransition = wrapper.find('LoadingTransition')

    expect(errorMessage.length).toBe(1)
    expect(loadingTransition.length).toBe(0)
  })

  it('should find title for adding new currency and tenor', () => {
    const wrapper = shallow(<CreateOrEditDepositLoan {...defaultProps} />)

    const h1 = wrapper.find('h1')

    expect(h1.text()).toBe('Add currency and tenor')
  })

  it('should find title for edit currency and tenor', () => {
    const wrapper = shallow(<CreateOrEditDepositLoan {...defaultProps} depositLoan={deposit1} id="123" />)

    const h1 = wrapper.find('h1')

    expect(h1.text()).toBe('USD 3 months')
  })

  it('should not find confirm for adding currency and tenor per default', () => {
    const wrapper = shallow(<CreateOrEditDepositLoan {...defaultProps} />)

    const confirm = wrapper.find('ConfirmWrapper')

    expect(confirm.length).toBe(0)
  })

  it('should find confirm for adding currency and tenor per default', () => {
    const wrapper = shallow(<CreateOrEditDepositLoan {...defaultProps} />)
    wrapper.setState({ values: deposit1 })

    const confirm = wrapper.find('ConfirmWrapper')

    expect(confirm.length).toBe(1)
  })

  it('should find confirm with appropriate header', () => {
    const wrapper = shallow(<CreateOrEditDepositLoan {...defaultProps} />)
    wrapper.setState({ values: deposit1 })

    const confirm = wrapper.find('ConfirmWrapper')

    expect(confirm.prop('header')).toBe('Add currency and tenor')
  })

  it('should find confirm with appropriate header', () => {
    const wrapper = shallow(<CreateOrEditDepositLoan {...defaultProps} depositLoan={deposit1} id="123" />)
    wrapper.setState({ values: deposit1 })

    const confirm = wrapper.find('ConfirmWrapper')

    expect(confirm.prop('header')).toBe('Update information')
  })

  it('should call createDepositLoan with values from state when handleConfirmSubmit is called', () => {
    const wrapper = shallow(<CreateOrEditDepositLoan {...defaultProps} />)
    wrapper.setState({ values: deposit1 })

    const instance = wrapper.instance() as CreateOrEditDepositLoan

    instance.handleConfirmSubmit()

    expect(defaultProps.createDepositLoan).toHaveBeenCalledWith(deposit1, CreditAppetiteDepositLoanFeature.Deposit)
  })

  it('should call editDepositLoan with values from state when handleConfirmSubmit is called', () => {
    const wrapper = shallow(<CreateOrEditDepositLoan {...defaultProps} depositLoan={deposit1} id="123" />)
    wrapper.setState({ values: deposit1 })

    const instance = wrapper.instance() as CreateOrEditDepositLoan

    instance.handleConfirmSubmit()

    expect(defaultProps.editDepositLoan).toHaveBeenCalledWith(deposit1, '123', CreditAppetiteDepositLoanFeature.Deposit)
  })

  it('should set state when handleSubmit is called', () => {
    const wrapper = shallow(<CreateOrEditDepositLoan {...defaultProps} />)

    const instance = wrapper.instance() as CreateOrEditDepositLoan

    instance.handleSubmit(deposit1)

    expect(wrapper.state('values')).toEqual(deposit1)
  })

  it('should restart state when handleCloseSubmit', () => {
    const wrapper = shallow(<CreateOrEditDepositLoan {...defaultProps} />)
    wrapper.setState({ values: deposit1 })

    const instance = wrapper.instance() as CreateOrEditDepositLoan

    instance.handleCloseSubmit()

    expect(wrapper.state('values')).toBeFalsy()
  })
})
