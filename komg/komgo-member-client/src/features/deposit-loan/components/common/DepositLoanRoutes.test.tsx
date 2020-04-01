import * as React from 'react'
import { shallow } from 'enzyme'
import { Route } from 'react-router-dom'

import { DepositLoanRoutes } from './DepositLoanRoutes'
import { CreateOrEditDepositLoan, DepositLoanDashboard, ViewDepositLoan } from '../../containers'
import { CreditAppetiteDepositLoanFeature } from '../../store/types'

describe('RiskCoverRoutes', () => {
  const defaultProps = {
    isFinancialInstitution: true,
    location: {
      search: '',
      pathname: '',
      state: null,
      hash: null
    },
    feature: CreditAppetiteDepositLoanFeature.Deposit
  }

  it('should render appropriate routes for risk cover when user company is financial institution', () => {
    const wrapper = shallow(<DepositLoanRoutes {...defaultProps} />)
    const pathMap = wrapper.find(Route).reduce((pathMap, route) => {
      const routeProps = route.props()
      pathMap[routeProps.path] = routeProps.render
      return pathMap
    }, {})
    expect(pathMap['/deposits']()).toEqual(<DepositLoanDashboard feature={CreditAppetiteDepositLoanFeature.Deposit} />)
    expect(pathMap['/deposits/new']()).toEqual(
      <CreateOrEditDepositLoan feature={CreditAppetiteDepositLoanFeature.Deposit} />
    )
    expect(pathMap['/deposits/:id/edit']()).toEqual(
      <CreateOrEditDepositLoan feature={CreditAppetiteDepositLoanFeature.Deposit} />
    )
    expect(pathMap['/deposits/:id']()).toEqual(<ViewDepositLoan feature={CreditAppetiteDepositLoanFeature.Deposit} />)
  })
})
