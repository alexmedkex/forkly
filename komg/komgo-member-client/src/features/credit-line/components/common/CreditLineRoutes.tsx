import * as React from 'react'
import { connect } from 'react-redux'
import { Route, Switch } from 'react-router-dom'
import { RouteProps } from 'react-router'

import {
  CreditLinesDashboard,
  CreateOrEditCreditLine,
  ViewCreditLine,
  DisclosedCreditLineSummaryDashboard,
  DisclosedCreditLineDetails,
  RequestInformation
} from '../../containers'
import { ApplicationState } from '../../../../store/reducers'
import { findFeature } from '../../utils/creditAppetiteTypes'
import { IProductProps } from '../../store/types'
import { ROUTES } from '../../routes'

interface IStateProps {
  isFinancialInstitution: boolean | null
}

interface IProps extends IStateProps, RouteProps, IProductProps {}

export const CreditLineRoutes = (props: IProps) => {
  const { productId, subProductId, isFinancialInstitution } = props
  const feature = findFeature({ productId, subProductId })

  if (isFinancialInstitution === null) {
    return null
  }
  if (isFinancialInstitution) {
    return (
      <Switch>
        <Route
          path={ROUTES[feature].financialInstitution.new}
          exact={true}
          render={() => <CreateOrEditCreditLine productId={productId} subProductId={subProductId} />}
        />
        <Route
          path={ROUTES[feature].financialInstitution.requestInfo}
          render={() => <CreateOrEditCreditLine productId={productId} subProductId={subProductId} />}
        />
        <Route
          path={ROUTES[feature].financialInstitution.edit}
          render={() => <CreateOrEditCreditLine productId={productId} subProductId={subProductId} />}
        />
        <Route
          path={ROUTES[feature].financialInstitution.view}
          render={() => <ViewCreditLine productId={productId} subProductId={subProductId} />}
        />
        <Route
          path={ROUTES[feature].financialInstitution.dashboard}
          exact={true}
          render={() => <CreditLinesDashboard productId={productId} subProductId={subProductId} />}
        />
      </Switch>
    )
  }
  return (
    <Switch>
      <Route
        path={ROUTES[feature].corporate.dashboard}
        exact={true}
        render={() => <DisclosedCreditLineSummaryDashboard productId={productId} subProductId={subProductId} />}
      />
      <Route
        path={ROUTES[feature].corporate.requestInfoUpdate}
        render={() => <RequestInformation productId={productId} subProductId={subProductId} />}
      />
      <Route
        path={ROUTES[feature].corporate.view}
        render={() => <DisclosedCreditLineDetails productId={productId} subProductId={subProductId} />}
      />
      <Route
        path={ROUTES[feature].corporate.requestInfoNew}
        exact={true}
        render={() => <RequestInformation productId={productId} subProductId={subProductId} />}
      />
    </Switch>
  )
}

const mapStateToProps = (state: ApplicationState): IStateProps => {
  const user = state.get('uiState').get('profile')
  const members = state
    .get('members')
    .get('byStaticId')
    .toJS()
  const company = members[user.company]
  return {
    isFinancialInstitution: company ? company.isFinancialInstitution : null
  }
}

export default connect(mapStateToProps)(CreditLineRoutes)
