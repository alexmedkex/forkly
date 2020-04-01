import * as React from 'react'
import { shallow } from 'enzyme'
import { CreateOrEditCreditLine, Action } from './CreateOrEditCreditLine'
import { fakeCounterparty, fakeMember } from '../../../letter-of-credit-legacy/utils/faker'
import { buildFakeRiskCover, buildFakeRiskCoverSharedData, buildFakeCreditLineRequestData } from '@komgo/types'
import { ICreateOrEditCreditLineForm, CreditLineType } from '../../store/types'
import { defaultShared } from '../../constants'
import { Products } from '../../../document-management/constants/Products'
import { SubProducts } from '../../../document-management/constants/SubProducts'
import { createInitialCreditLine } from '../../utils/factories'

describe('CreateOrEditCreditLine', () => {
  let defaultProps

  const initialRiskCoverValues = createInitialCreditLine(Products.TradeFinance, SubProducts.ReceivableDiscounting)

  const request1 = {
    ...buildFakeCreditLineRequestData({ counterpartyStaticId: 'buyer123', staticId: '123' }),
    companyName: 'Seller Name',
    counterpartyName: 'Buyer Name'
  }

  const requestsByCounterpartyId = {
    buyer123: [request1]
  }

  beforeEach(() => {
    defaultProps = {
      submittingError: [],
      isSubmitting: false,
      counterparties: [fakeCounterparty({ staticId: '123' })],
      members: [fakeMember({ staticId: '123' })],
      isFetching: false,
      errors: [],
      createCreditLine: jest.fn(),
      fetchConnectedCounterpartiesAsync: jest.fn(),
      fetchCreditLines: jest.fn(),
      clearError: jest.fn(),
      isAuthorized: jest.fn(() => true),
      fetchReceivedRequests: jest.fn(),
      requestsByCounterpartyId: {},
      isDeclining: false,
      decliningErrors: [],
      getCreditLine: jest.fn(),
      declineRequests: jest.fn(),
      productId: Products.TradeFinance,
      subProductId: SubProducts.ReceivableDiscounting,
      feature: CreditLineType.RiskCover,
      location: {
        search: ''
      },
      counterpartyId: '123'
    }
  })

  it('should render component successfully', () => {
    const wrapper = shallow(<CreateOrEditCreditLine {...defaultProps} />)

    expect(wrapper.exists()).toBe(true)
  })

  it('should call for counterparties, requests and credit lines', () => {
    const wrapper = shallow(<CreateOrEditCreditLine {...defaultProps} />)

    expect(defaultProps.fetchConnectedCounterpartiesAsync).toHaveBeenCalled()
    expect(defaultProps.fetchReceivedRequests).toHaveBeenCalled()
    expect(defaultProps.fetchCreditLines).toHaveBeenCalled()
  })

  it('should render loading component', () => {
    const wrapper = shallow(<CreateOrEditCreditLine {...defaultProps} isFetching={true} />)

    const loadingTransition = wrapper.find('LoadingTransition')
    const form = wrapper.find('CreateOrEditCreditLineForm')

    expect(loadingTransition.length).toBe(1)
    expect(form.length).toBe(0)
  })

  it('should render error component', () => {
    const wrapper = shallow(<CreateOrEditCreditLine {...defaultProps} errors={[{ message: 'Test' }]} />)

    const errorMessage = wrapper.find('ErrorMessage')
    const form = wrapper.find('CreateOrEditCreditLineForm')

    expect(errorMessage.length).toBe(1)
    expect(form.length).toBe(0)
  })

  it('should render form component and not render error or loading', () => {
    const wrapper = shallow(<CreateOrEditCreditLine {...defaultProps} />)

    const errorMessage = wrapper.find('ErrorMessage')
    const form = wrapper.find('CreateOrEditCreditLineForm')
    const loadingTransition = wrapper.find('LoadingTransition')

    expect(errorMessage.length).toBe(0)
    expect(loadingTransition.length).toBe(0)
    expect(form.length).toBe(1)
  })

  it('should render form component and not render error or loading', () => {
    const wrapper = shallow(<CreateOrEditCreditLine {...defaultProps} />)

    const h1 = wrapper.find('h1')

    expect(h1.text()).toBe('Add buyer')
  })

  it('should render form component and not render error or loading and feature is bank line', () => {
    const wrapper = shallow(<CreateOrEditCreditLine {...defaultProps} feature={CreditLineType.BankLine} />)

    const h1 = wrapper.find('h1')

    expect(h1.text()).toBe('Add issuing bank')
  })

  it('should set values to state when handleOpenConfirm is called', () => {
    const wrapper = shallow(<CreateOrEditCreditLine {...defaultProps} />)
    const fakeRiskCover = {
      ...buildFakeRiskCover(),
      sharedCreditLines: [],
      creditExpiryDate: ''
    } as ICreateOrEditCreditLineForm

    const instance = wrapper.instance() as CreateOrEditCreditLine

    instance.handleOpenConfirm(fakeRiskCover)

    expect(wrapper.state()).toEqual({
      openConfirm: true,
      values: fakeRiskCover
    })
  })

  it('should delete values from state when handleCloseConfirm is called', () => {
    const wrapper = shallow(<CreateOrEditCreditLine {...defaultProps} />)
    const fakeRiskCover = {
      ...buildFakeRiskCover(),
      sharedCreditLines: [],
      creditExpiryDate: ''
    } as ICreateOrEditCreditLineForm

    wrapper.setState({
      openConfirm: true,
      values: fakeRiskCover
    })

    const instance = wrapper.instance() as CreateOrEditCreditLine

    instance.handleCloseConfirm()

    expect(wrapper.state()).toEqual({
      openConfirm: false
    })
  })

  it('should call createCreditLine when handleConfirmSubmit is called', () => {
    const wrapper = shallow(<CreateOrEditCreditLine {...defaultProps} />)
    const fakeRiskCover = {
      ...buildFakeRiskCover({ counterpartyStaticId: '123' }),
      sharedCreditLines: [],
      creditExpiryDate: ''
    } as ICreateOrEditCreditLineForm

    wrapper.setState({
      openConfirm: true,
      values: fakeRiskCover
    })

    const instance = wrapper.instance() as CreateOrEditCreditLine

    instance.handleConfirmSubmit()

    expect(defaultProps.createCreditLine).toHaveBeenCalledWith(fakeRiskCover, 'Applicant Name')
  })

  it('should render unauthorized message', () => {
    const wrapper = shallow(<CreateOrEditCreditLine {...defaultProps} isAuthorized={jest.fn(() => false)} />)

    const unauthorized = wrapper.find('Unauthorized')

    expect(unauthorized.length).toBe(1)
  })

  it('getCurrentAction should return EditRiskCover', () => {
    const fakeRiskCover = { ...buildFakeRiskCover(), sharedCreditLines: [], staticId: '123' }
    const wrapper = shallow(<CreateOrEditCreditLine {...defaultProps} id="123" creditLine={fakeRiskCover} />)

    const instance = wrapper.instance() as CreateOrEditCreditLine

    expect(instance.getCurrentAction()).toBe(Action.EditRiskCover)
  })

  it('getCurrentAction should return CreateNewRiskCover as action', () => {
    const wrapper = shallow(<CreateOrEditCreditLine {...defaultProps} />)

    const instance = wrapper.instance() as CreateOrEditCreditLine

    expect(instance.getCurrentAction()).toBe(Action.CreateNewRiskCover)
  })

  it('getCurrentAction should return EditRiskCoverFromRequest', () => {
    const buyer = fakeMember({ staticId: 'buyer123' })
    const fakeRiskCover = {
      ...buildFakeRiskCover({ staticId: '123', counterpartyStaticId: 'Member1' }),
      sharedCreditLines: []
    }
    const wrapper = shallow(
      <CreateOrEditCreditLine
        {...defaultProps}
        counterparty={buyer}
        creditLine={fakeRiskCover}
        requestsByCounterpartyId={requestsByCounterpartyId}
      />
    )

    const instance = wrapper.instance() as CreateOrEditCreditLine

    expect(instance.getCurrentAction()).toBe(Action.EditRiskCoverFromRequest)
  })

  it('getCurrentAction should return CreateNewFromRequestRiskCover', () => {
    const buyer = fakeMember({ staticId: 'buyer123' })
    const wrapper = shallow(
      <CreateOrEditCreditLine
        {...defaultProps}
        counterparty={buyer}
        requestsByCounterpartyId={requestsByCounterpartyId}
      />
    )

    const instance = wrapper.instance() as CreateOrEditCreditLine

    expect(instance.getCurrentAction()).toBe(Action.CreateNewFromRequestRiskCover)
  })

  it('getInitialValues should return aproprirate object when action is EditRiskCover', () => {
    const fakeRiskCover = { ...buildFakeRiskCover(), sharedCreditLines: [], staticId: '123', creditExpiryDate: '' }
    const wrapper = shallow(<CreateOrEditCreditLine {...defaultProps} id="123" creditLine={fakeRiskCover} />)

    const instance = wrapper.instance() as CreateOrEditCreditLine

    const expectedInitialData = {
      ...fakeRiskCover,
      sharedCreditLines: [defaultShared]
    }

    expect(instance.getInitialValues()).toEqual(expectedInitialData)
  })

  it('getInitialValues should return aproprirate object when action is EditRiskCover and sharedCreditLines is not empty array ', () => {
    const fakeShareCreditLine = buildFakeRiskCoverSharedData()
    const fakeRiskCover = {
      ...buildFakeRiskCover(),
      sharedCreditLines: [fakeShareCreditLine],
      staticId: '123',
      creditExpiryDate: ''
    }
    const wrapper = shallow(<CreateOrEditCreditLine {...defaultProps} id="123" creditLine={fakeRiskCover} />)

    const instance = wrapper.instance() as CreateOrEditCreditLine

    const expectedInitialData = {
      ...fakeRiskCover,
      sharedCreditLines: [fakeShareCreditLine, defaultShared]
    }

    expect(instance.getInitialValues()).toEqual(expectedInitialData)
  })

  it('getInitialValues should return initial values', () => {
    const wrapper = shallow(<CreateOrEditCreditLine {...defaultProps} location={{ search: '?counterpartyId=123' }} />)

    const instance = wrapper.instance() as CreateOrEditCreditLine

    expect(instance.getInitialValues()).toEqual({ ...initialRiskCoverValues, counterpartyStaticId: '123' })
  })

  it('getInitialValues should return initial value when there is a request', () => {
    const buyer = fakeMember({ staticId: 'buyer123' })
    const fakeRiskCover = {
      ...buildFakeRiskCover({ staticId: '123', counterpartyStaticId: 'Member1' }),
      sharedCreditLines: [],
      creditExpiryDate: ''
    }
    const wrapper = shallow(
      <CreateOrEditCreditLine
        {...defaultProps}
        counterparty={buyer}
        creditLine={fakeRiskCover}
        requestsByCounterpartyId={requestsByCounterpartyId}
      />
    )

    const expectedInitialData = {
      ...fakeRiskCover,
      sharedCreditLines: [defaultShared]
    }

    const instance = wrapper.instance() as CreateOrEditCreditLine

    expect(instance.getInitialValues()).toEqual(expectedInitialData)
  })

  it('getInitialValues should return init values', () => {
    const buyer = fakeMember({ staticId: 'buyer123' })
    const wrapper = shallow(
      <CreateOrEditCreditLine
        {...defaultProps}
        counterparty={buyer}
        requestsByCounterpartyId={requestsByCounterpartyId}
      />
    )

    const instance = wrapper.instance() as CreateOrEditCreditLine

    const expectedInitialData = {
      ...initialRiskCoverValues,
      sharedCreditLines: [
        {
          ...defaultShared,
          requestStaticId: '123',
          counterpartyStaticId: 'buyer123',
          sharedWithStaticId: requestsByCounterpartyId.buyer123[0].companyStaticId
        },
        defaultShared
      ],
      counterpartyStaticId: 'buyer123',
      creditExpiryDate: ''
    }

    expect(instance.getInitialValues()).toEqual(expectedInitialData)
  })

  it('should set in state all declined request when handleOpenConfirmForDeclineAllRequests is called', () => {
    const wrapper = shallow(<CreateOrEditCreditLine {...defaultProps} />)

    const instance = wrapper.instance() as CreateOrEditCreditLine
    instance.handleOpenConfirmForDeclineAllRequests([request1 as any])

    expect(wrapper.state().declineRequests).toEqual([request1])
  })

  it('should remove declineRequests from state when handleCloseConfirmDeclineAllRequests is called', () => {
    const wrapper = shallow(<CreateOrEditCreditLine {...defaultProps} />)
    wrapper.setState({
      declineRequests: [request1]
    })

    const instance = wrapper.instance() as CreateOrEditCreditLine
    instance.handleCloseConfirmDeclineAllRequests()

    expect(wrapper.state().declineRequests).toBeFalsy()
  })

  it('should call declineRequests when handleConfirmDeclineAllRequests is called', () => {
    const wrapper = shallow(<CreateOrEditCreditLine {...defaultProps} />)
    wrapper.setState({
      declineRequests: [request1]
    })

    const instance = wrapper.instance() as CreateOrEditCreditLine
    instance.handleConfirmDeclineAllRequests()

    expect(defaultProps.declineRequests).toHaveBeenCalledWith(
      Products.TradeFinance,
      SubProducts.ReceivableDiscounting,
      'buyer123',
      ['123']
    )
  })
})
