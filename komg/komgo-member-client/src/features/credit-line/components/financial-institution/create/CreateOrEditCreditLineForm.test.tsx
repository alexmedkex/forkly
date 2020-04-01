import * as React from 'react'
import { shallow } from 'enzyme'
import { buildFakeCreditLineRequestData } from '@komgo/types'
import CreateOrEditCreditLineForm from './CreateOrEditCreditLineForm'
import { fakeCounterparty } from '../../../../letter-of-credit-legacy/utils/faker'
import CreateOrEditRiskCoverSeller from './CreateOrEditCreditLineSharedWithCompany'
import { createInitialCreditLine } from '../../../utils/factories'
import { Products } from '../../../../document-management/constants/Products'
import { SubProducts } from '../../../../document-management/constants/SubProducts'
import { CreditLineType } from '../../../store/types'

describe('CreateOrEditCreditLineForm', () => {
  let defaultProps
  const initialRiskCoverValues = createInitialCreditLine(Products.TradeFinance, SubProducts.ReceivableDiscounting)

  const request1 = {
    ...buildFakeCreditLineRequestData({
      counterpartyStaticId: 'buyer123',
      companyStaticId: 'seller123',
      staticId: '123'
    }),
    companyName: 'Seller Name',
    counterpartyName: 'Buyer Name'
  }

  beforeEach(() => {
    defaultProps = {
      initialValues: { ...initialRiskCoverValues },
      counterparties: [fakeCounterparty()],
      membersFiltered: [],
      handleSubmit: jest.fn(),
      history: { goBack: jest.fn() },
      requests: {},
      handleDeclineAllRequests: jest.fn(),
      feature: CreditLineType.RiskCover
    }
  })

  it('should render successfully', () => {
    const wrapper = shallow(<CreateOrEditCreditLineForm {...defaultProps} />)

    expect(wrapper.exists()).toBe(true)
  })

  it('should call history back when button for cancel is called', () => {
    const wrapper = shallow(<CreateOrEditCreditLineForm {...defaultProps} />)

    const cancel = wrapper
      .find('Formik')
      .shallow()
      .find('[data-test-id="cancel"]')

    cancel.simulate('click')

    expect(defaultProps.history.goBack).toHaveBeenCalled()
  })

  it('should call handleDeclineAllRequests with array of requests', () => {
    const requests = {
      buyer123: [request1]
    }
    const wrapper = shallow(<CreateOrEditCreditLineForm {...defaultProps} requests={requests} />)

    const instance = wrapper.instance() as CreateOrEditCreditLineForm
    instance.handleDeclineRequests('buyer123')

    expect(defaultProps.handleDeclineAllRequests).toHaveBeenCalledWith([request1])
  })

  it('should find 2 seller section when buyer exists in requests', () => {
    const requests = {
      buyer123: [request1]
    }
    const wrapper = shallow(
      <CreateOrEditCreditLineForm
        {...defaultProps}
        requests={requests}
        initialValues={{ ...initialRiskCoverValues, counterpartyStaticId: 'buyer123' }}
      />
    )

    const sellerSections = wrapper
      .find('Formik')
      .dive()
      .find(CreateOrEditRiskCoverSeller)

    expect(sellerSections.length).toBe(2)
  })

  it('should find 1 seller section per default', () => {
    const wrapper = shallow(<CreateOrEditCreditLineForm {...defaultProps} />)

    const sellerSections = wrapper
      .find('Formik')
      .dive()
      .find(CreateOrEditRiskCoverSeller)

    expect(sellerSections.length).toBe(1)
  })
})
