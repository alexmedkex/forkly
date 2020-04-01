import * as React from 'react'
import { MemoryRouter as Router } from 'react-router-dom'
import moment from 'moment-timezone'

import { buildFakeRiskCover } from '@komgo/types'
import { ViewCreditLine } from './ViewCreditLine'
import * as renderer from 'react-test-renderer'
import { shallow } from 'enzyme'
import { ErrorMessage, LoadingTransition } from '../../../../components'
import ViewRiskCoverData from '../../components/financial-institution/credit-line-view/CreditLineView'
import { CreditLineType } from '../../store/types'
import { Products } from '../../../document-management/constants/Products'
import { SubProducts } from '../../../document-management/constants/SubProducts'

describe('ViewCreditLine', () => {
  let defaultProps

  beforeEach(() => {
    moment.tz.guess = jest.fn(() => 'Europe/Belgrade')
    moment.tz.setDefault('Europe/Belgrade')
    Date.now = jest.fn(() => 1487076708000)

    defaultProps = {
      creditLine: { ...buildFakeRiskCover(), counterpartyName: 'counterparty' },
      isFetching: false,
      errors: [],
      isAuthorized: jest.fn(() => true),
      getCreditLine: jest.fn(),
      match: { params: { id: '1' } },
      feature: CreditLineType.RiskCover,
      productId: Products.TradeFinance,
      subProductId: SubProducts.ReceivableDiscounting
    }
  })

  it('should match shapshot', () => {
    expect(
      renderer
        .create(
          <Router>
            <ViewCreditLine {...defaultProps} />
          </Router>
        )
        .toJSON()
    ).toMatchSnapshot()
  })

  it('should display Error component if has error', () => {
    const props = { ...defaultProps, errors: ['some error'] }

    const wrapper = shallow(<ViewCreditLine {...props} />)

    expect(wrapper.find(ErrorMessage).exists()).toBeTruthy()
  })

  it('should display Loader component if fetching', () => {
    const props = { ...defaultProps, isFetching: true }

    const wrapper = shallow(<ViewCreditLine {...props} />)

    expect(wrapper.find(LoadingTransition).exists()).toBeTruthy()
  })

  it('should display View data component', () => {
    const wrapper = shallow(<ViewCreditLine {...defaultProps} />)

    expect(wrapper.find(ViewRiskCoverData).exists()).toBeTruthy()
  })

  it('should get risck cover data', () => {
    const wrapper = shallow(<ViewCreditLine {...defaultProps} />)

    expect(defaultProps.getCreditLine).toHaveBeenCalledWith(
      '1',
      Products.TradeFinance,
      SubProducts.ReceivableDiscounting
    )
  })

  it('should render unauthorized message', () => {
    const wrapper = shallow(<ViewCreditLine {...defaultProps} isAuthorized={jest.fn(() => false)} />)

    const unauthorized = wrapper.find('Unauthorized')

    expect(unauthorized.length).toBe(1)
  })
})
