import * as React from 'react'
import { shallow } from 'enzyme'
import { Route } from 'react-router-dom'
import { CreditLineRoutes } from './CreditLineRoutes'
import {
  CreditLinesDashboard,
  CreateOrEditCreditLine,
  ViewCreditLine,
  DisclosedCreditLineSummaryDashboard,
  DisclosedCreditLineDetails,
  RequestInformation
} from '../../containers'
import { Products } from '../../../document-management/constants/Products'
import { SubProducts } from '../../../document-management/constants/SubProducts'

describe('RiskCoverRoutes', () => {
  const defaultProps = {
    isFinancialInstitution: true,
    location: {
      search: '',
      pathname: '',
      state: null,
      hash: null
    },
    productId: Products.TradeFinance,
    subProductId: SubProducts.ReceivableDiscounting
  }

  it('should render appropriate routes for risk cover when user company is financial institution', () => {
    const wrapper = shallow(<CreditLineRoutes {...defaultProps} />)
    const pathMap = wrapper.find(Route).reduce((pathMap, route) => {
      const routeProps = route.props()
      pathMap[routeProps.path] = routeProps.render
      return pathMap
    }, {})
    expect(pathMap['/risk-cover']()).toEqual(
      <CreditLinesDashboard productId={Products.TradeFinance} subProductId={SubProducts.ReceivableDiscounting} />
    )
    expect(pathMap['/risk-cover/new']()).toEqual(
      <CreateOrEditCreditLine productId={Products.TradeFinance} subProductId={SubProducts.ReceivableDiscounting} />
    )
    expect(pathMap['/risk-cover/:id/edit']()).toEqual(
      <CreateOrEditCreditLine productId={Products.TradeFinance} subProductId={SubProducts.ReceivableDiscounting} />
    )
    expect(pathMap['/risk-cover/:id']()).toEqual(
      <ViewCreditLine productId={Products.TradeFinance} subProductId={SubProducts.ReceivableDiscounting} />
    )
  })
  it('should render appropriate routes when user company is not financial institution', () => {
    const wrapper = shallow(<CreditLineRoutes {...defaultProps} isFinancialInstitution={false} />)
    const pathMap = wrapper.find(Route).reduce((pathMap, route) => {
      const routeProps = route.props()
      pathMap[routeProps.path] = routeProps.render
      return pathMap
    }, {})
    expect(pathMap['/risk-cover']()).toEqual(
      <DisclosedCreditLineSummaryDashboard
        productId={Products.TradeFinance}
        subProductId={SubProducts.ReceivableDiscounting}
      />
    )
    expect(pathMap['/risk-cover/buyers/:id/request-information/new']()).toEqual(
      <RequestInformation productId={Products.TradeFinance} subProductId={SubProducts.ReceivableDiscounting} />
    )
    expect(pathMap['/risk-cover/buyers/:id']()).toEqual(
      <DisclosedCreditLineDetails productId={Products.TradeFinance} subProductId={SubProducts.ReceivableDiscounting} />
    )
    expect(pathMap['/risk-cover/request-information/new']()).toEqual(
      <RequestInformation productId={Products.TradeFinance} subProductId={SubProducts.ReceivableDiscounting} />
    )
  })
})
