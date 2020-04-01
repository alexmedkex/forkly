import * as React from 'react'
import { shallow } from 'enzyme'
import { tradeFinanceManager } from '@komgo/permissions'

import { RequestInformation } from './RequestInformation'
import { fakeMember } from '../../../letter-of-credit-legacy/utils/faker'
import {
  IRequestDepositLoanInformationForm,
  CreditAppetiteDepositLoanFeature,
  DepositLoanActionType,
  ICreateDepositLoanRequest
} from '../../store/types'
import { DepositLoanType, Currency, DepositLoanPeriod } from '@komgo/types'

const fakeRequestInfoData: IRequestDepositLoanInformationForm = {
  type: DepositLoanType.Deposit,
  comment: 'test',
  requestForId: 'EUR/MONTHS/3',
  companyIds: ['1234'],
  mailTo: false
}

describe('RequestInformation', () => {
  let defaultProps: any

  beforeEach(() => {
    defaultProps = {
      counterparties: [],
      isSubmitting: false,
      submittingErrors: [],
      isFetching: false,
      summariesSignatures: [],
      disclosedDepositsLoans: [],
      errors: [],
      createRequestInformation: jest.fn(),
      fetchConnectedCounterpartiesAsync: jest.fn(),
      clearError: jest.fn(),
      history: {},
      isAuthorized: jest.fn(() => true),
      fetchDisclosedDepositsLoans: jest.fn(),
      fetchDisclosedSummaries: jest.fn(),
      feature: CreditAppetiteDepositLoanFeature.Deposit
    }
  })

  it('should render component successfully and call api for counterparties', () => {
    const wrapper = shallow(<RequestInformation {...defaultProps} />)

    expect(wrapper.exists()).toBe(true)
    expect(defaultProps.fetchConnectedCounterpartiesAsync).toHaveBeenCalled()
  })

  it('should call api for disclosed summaries if it is request for new and not called for disclosed deposits or loans', () => {
    const wrapper = shallow(<RequestInformation {...defaultProps} />)

    expect(defaultProps.fetchDisclosedSummaries).toHaveBeenCalled()
    expect(defaultProps.fetchDisclosedDepositsLoans).not.toHaveBeenCalled()
  })

  it('should call for disclosed deposits and loans and should not call for summaries if it is request for update', () => {
    const wrapper = shallow(
      <RequestInformation {...defaultProps} params={{ currency: Currency.EUR, period: DepositLoanPeriod.Overnight }} />
    )

    expect(defaultProps.fetchDisclosedSummaries).not.toHaveBeenCalled()
    expect(defaultProps.fetchDisclosedDepositsLoans).toHaveBeenCalled()
  })

  it('should find unauthorized', () => {
    const isAuthorized = (role: any) => {
      if (role === tradeFinanceManager.canCrudDeposit) {
        return false
      }
      return true
    }
    const wrapper = shallow(<RequestInformation {...defaultProps} isAuthorized={isAuthorized} />)

    const unauthorized = wrapper.find('Unauthorized')

    expect(unauthorized.length).toBe(1)
  })

  it('should not find unauthorized if user can crud loans and user try to crud deposit', () => {
    const isAuthorized = (role: any) => {
      if (role === tradeFinanceManager.canCrudLoan) {
        return false
      }
      return true
    }
    const wrapper = shallow(<RequestInformation {...defaultProps} isAuthorized={isAuthorized} />)

    const unauthorized = wrapper.find('Unauthorized')

    expect(unauthorized.length).toBe(0)
  })

  it('should find LoadingTransition', () => {
    const wrapper = shallow(<RequestInformation {...defaultProps} isFetching={true} />)

    const loadingTransition = wrapper.find('LoadingTransition')

    expect(loadingTransition.length).toBe(1)
  })

  it('should find ErrorMessage', () => {
    const wrapper = shallow(<RequestInformation {...defaultProps} errors={[{ message: 'Error' }]} />)

    const errorMessage = wrapper.find('ErrorMessage')

    expect(errorMessage.length).toBe(1)
  })

  it('should find header with appropriate text - new deposit loan', () => {
    const wrapper = shallow(<RequestInformation {...defaultProps} />)

    const h1 = wrapper.find('h1')

    expect(h1.length).toBe(1)
    expect(h1.text()).toBe('Request information for a new currency and tenor')
  })

  it('should find paragraph with appropriate text - new deposit loan', () => {
    const wrapper = shallow(<RequestInformation {...defaultProps} />)

    const p = wrapper.find('p').first()

    expect(p.text()).toBe(
      'Ask banks to disclose information relating to their pricing on a specific currency and tenor.'
    )
  })

  it('should find header with appropriate text - request for update ', () => {
    const wrapper = shallow(
      <RequestInformation {...defaultProps} params={{ currency: Currency.EUR, period: DepositLoanPeriod.Overnight }} />
    )

    const h1 = wrapper.find('h1')

    expect(h1.length).toBe(1)
    expect(h1.text()).toBe('Request an update for EUR overnight')
  })

  it('should find header with appropriate text - request for update ', () => {
    const wrapper = shallow(
      <RequestInformation
        {...defaultProps}
        params={{ currency: Currency.EUR, period: DepositLoanPeriod.Months, periodDuration: 3 }}
      />
    )

    const h1 = wrapper.find('h1')

    expect(h1.length).toBe(1)
    expect(h1.text()).toBe('Request an update for EUR 3 months')
  })

  it('should find paragraph with appropriate text - request for update', () => {
    const wrapper = shallow(
      <RequestInformation
        {...defaultProps}
        params={{ currency: Currency.EUR, period: DepositLoanPeriod.Months, periodDuration: 3 }}
      />
    )

    const p = wrapper.find('p').first()

    expect(p.text()).toBe('Ask banks to disclose information relating to their pricing on EUR 3 months.')
  })

  it('should find form component', () => {
    const wrapper = shallow(<RequestInformation {...defaultProps} />)

    const requestInformationForm = wrapper.find('RequestInformationForm')

    expect(requestInformationForm.length).toBe(1)
  })

  it('should find confirm', () => {
    const wrapper = shallow(<RequestInformation {...defaultProps} />)
    wrapper.setState({ values: fakeRequestInfoData })

    const confirm = wrapper.find('ConfirmWrapper')

    expect(confirm.length).toBe(1)
  })

  it('should set values in state when handleSubmit is called', () => {
    const wrapper = shallow(<RequestInformation {...defaultProps} />)

    const instance = wrapper.instance() as RequestInformation
    instance.handleSubmit(fakeRequestInfoData)

    expect(wrapper.state().values).toEqual(fakeRequestInfoData)
  })

  it('should call createRequestInformation when handleConfirmSubmit is called', () => {
    const wrapper = shallow(<RequestInformation {...defaultProps} />)
    wrapper.setState({ values: fakeRequestInfoData })
    const expectedData: ICreateDepositLoanRequest = {
      comment: 'test',
      currency: Currency.EUR,
      period: DepositLoanPeriod.Months,
      periodDuration: 3,
      companyIds: ['1234'],
      type: DepositLoanType.Deposit
    }

    const instance = wrapper.instance() as RequestInformation
    instance.handleConfirmSubmit()

    expect(defaultProps.createRequestInformation).toHaveBeenCalledWith(
      expectedData,
      CreditAppetiteDepositLoanFeature.Deposit,
      undefined
    )
  })

  it('should call createRequestInformation when handleConfirmSubmit is called with data and mail info', () => {
    const member = fakeMember({ staticId: '123' })
    const wrapper = shallow(<RequestInformation {...defaultProps} members={[member]} />)
    wrapper.setState({ values: { ...fakeRequestInfoData, mailTo: true } })
    const expectedData: ICreateDepositLoanRequest = {
      comment: 'test',
      currency: Currency.EUR,
      period: DepositLoanPeriod.Months,
      periodDuration: 3,
      companyIds: ['1234'],
      type: DepositLoanType.Deposit
    }

    const expectedMailData = {
      body: 'test',
      email: '',
      subject: 'Appetite on EUR 3 months in the context of Deposit'
    }

    const instance = wrapper.instance() as RequestInformation
    instance.handleConfirmSubmit()

    expect(defaultProps.createRequestInformation).toHaveBeenCalledWith(
      expectedData,
      CreditAppetiteDepositLoanFeature.Deposit,
      expectedMailData
    )
  })

  it('should reset state when handleCancelSubmit is called', () => {
    const wrapper = shallow(<RequestInformation {...defaultProps} />)
    wrapper.setState({ values: fakeRequestInfoData })

    const instance = wrapper.instance() as RequestInformation
    instance.handleCloseSubmit()

    expect(wrapper.state().values).toBeFalsy()
  })

  it('should call clearError if error exists and handleCancelSubmit is called', () => {
    const wrapper = shallow(<RequestInformation {...defaultProps} submittingErrors={[{ message: 'Error' }]} />)
    wrapper.setState({ values: fakeRequestInfoData })

    const instance = wrapper.instance() as RequestInformation
    instance.handleCloseSubmit()

    expect(defaultProps.clearError).toHaveBeenCalledWith(DepositLoanActionType.CreateReqDepositLoanInformationRequest)
  })

  it('should filter out already existed deposits and loans', () => {
    const wrapper = shallow(<RequestInformation {...defaultProps} summariesSignatures={['EUR 3 months']} />)

    const instance = wrapper.instance() as RequestInformation

    const options = instance.getCurrencyAndTenorDropodownOptions()

    expect(options.length).toBe(34)
  })
})
