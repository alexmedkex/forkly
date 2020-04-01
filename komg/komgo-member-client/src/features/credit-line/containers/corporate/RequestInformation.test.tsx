import * as React from 'react'
import { shallow } from 'enzyme'
import { tradeFinanceManager } from '@komgo/permissions'

import { RequestInformation } from './RequestInformation'
import { CreditLineActionType, CreditLineType, IRequestCreditLineForm } from '../../store/types'
import { fakeMember } from '../../../letter-of-credit-legacy/utils/faker'
import { Products } from '../../../document-management/constants/Products'
import { SubProducts } from '../../../document-management/constants/SubProducts'

const fakeRequestInfoData: IRequestCreditLineForm = {
  context: {
    productId: 'tradeFinance',
    subProductId: 'rd'
  },
  comment: 'test',
  requestForId: '123',
  companyIds: ['1234'],
  mailTo: false
}

describe('RequestInformation', () => {
  let defaultProps: any

  beforeEach(() => {
    defaultProps = {
      members: [fakeMember()],
      counterparties: [],
      isSubmitting: false,
      submittingErrors: [],
      isFetching: false,
      errors: [],
      createRequestInformation: jest.fn(),
      fetchConnectedCounterpartiesAsync: jest.fn(),
      clearError: jest.fn(),
      history: {},
      isAuthorized: jest.fn(() => true),
      fetchDisclosedCreditLineSummaries: jest.fn(),
      fetchDisclosedCreditLines: jest.fn(),
      productId: Products.TradeFinance,
      subProductId: SubProducts.ReceivableDiscounting,
      feature: CreditLineType.RiskCover
    }
  })

  it('should render component successfully and call api for counterparties', () => {
    const wrapper = shallow(<RequestInformation {...defaultProps} />)

    expect(wrapper.exists()).toBe(true)
    expect(defaultProps.fetchConnectedCounterpartiesAsync).toHaveBeenCalled()
  })

  it('should call api for disclosed summary if there is not id in props and not called for disclosed credit lines for specific buyer', () => {
    const wrapper = shallow(<RequestInformation {...defaultProps} />)

    expect(defaultProps.fetchDisclosedCreditLineSummaries).toHaveBeenCalled()
    expect(defaultProps.fetchDisclosedCreditLines).not.toHaveBeenCalled()
  })

  it('should not call api for disclosed summary if there is not id in props and call for disclosed credit lines for specific buyer', () => {
    const wrapper = shallow(<RequestInformation {...defaultProps} id={123} />)

    expect(defaultProps.fetchDisclosedCreditLineSummaries).not.toHaveBeenCalled()
    expect(defaultProps.fetchDisclosedCreditLines).toHaveBeenCalled()
  })

  it('should find unauthorized', () => {
    const isAuthorized = (role: any) => {
      if (role === tradeFinanceManager.canCrudRiskCover) {
        return false
      }
      return true
    }
    const wrapper = shallow(<RequestInformation {...defaultProps} isAuthorized={isAuthorized} />)

    const unauthorized = wrapper.find('Unauthorized')

    expect(unauthorized.length).toBe(1)
  })

  it('should find not find unauthorized if user can crud Bank lines', () => {
    const isAuthorized = (role: any) => {
      if (role === tradeFinanceManager.canCrudRiskCover) {
        return false
      }
      return true
    }
    const wrapper = shallow(
      <RequestInformation {...defaultProps} isAuthorized={isAuthorized} feature={CreditLineType.BankLine} />
    )

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

  it('should find header with appropriate text - new buyer', () => {
    const wrapper = shallow(<RequestInformation {...defaultProps} />)

    const h1 = wrapper.find('h1')

    expect(h1.length).toBe(1)
    expect(h1.text()).toBe('Request information for a New Buyer')
  })

  it('should find header with appropriate text - new issuing bank', () => {
    const wrapper = shallow(<RequestInformation {...defaultProps} feature={CreditLineType.BankLine} />)

    const h1 = wrapper.find('h1')

    expect(h1.length).toBe(1)
    expect(h1.text()).toBe('Request information for a New Issuing Bank')
  })

  it('should find paragraph with appropriate text - new buyer', () => {
    const wrapper = shallow(<RequestInformation {...defaultProps} />)

    const p = wrapper.find('p').first()

    expect(p.text()).toBe(
      'Ask banks to disclose information relating to their risk cover appetite on a particiluar buyer.'
    )
  })

  it('should find paragraph with appropriate text - new buyer', () => {
    const wrapper = shallow(<RequestInformation {...defaultProps} feature={CreditLineType.BankLine} />)

    const p = wrapper.find('p').first()

    expect(p.text()).toBe(
      'Ask banks to disclose information relating to their bank lines appetite on a particular issuing bank.'
    )
  })

  it('should find header with appropriate text - update buyer', () => {
    const wrapper = shallow(
      <RequestInformation {...defaultProps} memberToUpdate={fakeMember({ commonName: 'Buyer123' })} />
    )

    const h1 = wrapper.find('h1')

    expect(h1.length).toBe(1)
    expect(h1.text()).toBe('Request an update for Buyer123')
  })

  it('should find paragraph with appropriate text - update buyer', () => {
    const wrapper = shallow(
      <RequestInformation {...defaultProps} memberToUpdate={fakeMember({ commonName: 'Buyer123' })} />
    )

    const p = wrapper.find('p').first()

    expect(p.text()).toBe('Ask banks to update information relating to their risk cover appetite on Buyer123.')
  })

  it('should find paragraph with appropriate text - update buyer', () => {
    const wrapper = shallow(
      <RequestInformation
        {...defaultProps}
        memberToUpdate={fakeMember({ commonName: 'Bank123' })}
        feature={CreditLineType.BankLine}
      />
    )

    const p = wrapper.find('p').first()

    expect(p.text()).toBe('Ask banks to update information relating to their bank lines appetite on Bank123.')
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
    const expectedData = {
      context: {
        productId: 'tradeFinance',
        subProductId: 'rd'
      },
      comment: 'test',
      counterpartyStaticId: '123',
      companyIds: ['1234']
    }

    const instance = wrapper.instance() as RequestInformation
    instance.handleConfirmSubmit()

    expect(defaultProps.createRequestInformation).toHaveBeenCalledWith(expectedData, undefined)
  })

  it('should call createRequestInformation when handleConfirmSubmit is called with data and mail info', () => {
    const member = fakeMember({ staticId: '123' })
    const wrapper = shallow(<RequestInformation {...defaultProps} members={[member]} />)
    wrapper.setState({ values: { ...fakeRequestInfoData, mailTo: true } })
    const expectedData = {
      context: {
        productId: 'tradeFinance',
        subProductId: 'rd'
      },
      comment: 'test',
      counterpartyStaticId: '123',
      companyIds: ['1234']
    }

    const expectedMailData = {
      body: 'test',
      email: '',
      subject: 'Appetite on Applicant Name in the context of Silent Cover'
    }

    const instance = wrapper.instance() as RequestInformation
    instance.handleConfirmSubmit()

    expect(defaultProps.createRequestInformation).toHaveBeenCalledWith(expectedData, expectedMailData)
  })

  it('should reset state when handleCancelSubmit is called', () => {
    const wrapper = shallow(<RequestInformation {...defaultProps} />)
    wrapper.setState({ values: fakeRequestInfoData })

    const instance = wrapper.instance() as RequestInformation
    instance.handleCancelSubmit()

    expect(wrapper.state().values).toBeFalsy()
  })

  it('should call clearError if error exists and handleCancelSubmit is called', () => {
    const wrapper = shallow(<RequestInformation {...defaultProps} submittingErrors={[{ message: 'Error' }]} />)
    wrapper.setState({ values: fakeRequestInfoData })

    const instance = wrapper.instance() as RequestInformation
    instance.handleCancelSubmit()

    expect(defaultProps.clearError).toHaveBeenCalledWith(CreditLineActionType.CreateReqInformationRequest)
  })

  it('should format members for buyers dropdown', () => {
    const wrapper = shallow(<RequestInformation {...defaultProps} />)

    const instance = wrapper.instance() as RequestInformation

    const buyers = instance.getCounterpartyDropdownItems()
    const expectedBuyers = [
      {
        text: defaultProps.members[0].x500Name.CN,
        value: defaultProps.members[0].staticId
      }
    ]

    expect(buyers).toEqual(expectedBuyers)
  })
})
