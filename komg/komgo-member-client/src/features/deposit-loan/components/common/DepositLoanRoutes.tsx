import * as React from 'react'
import { connect } from 'react-redux'
import { Route, Switch } from 'react-router-dom'
import { RouteProps } from 'react-router'

import {
  DepositLoanDashboard,
  CreateOrEditDepositLoan,
  ViewDepositLoan,
  DepositLoanCurrencyAndTenorDetails,
  DepositLoanSummariesDashboard,
  RequestInformation
} from '../../containers'
import { ApplicationState } from '../../../../store/reducers'
import { CreditAppetiteDepositLoanFeature } from '../../store/types'
import { ROUTES } from '../../routes'

interface IDepositLoanRoutesProps {
  isFinancialInstitution: boolean | null
}

interface IProps extends IDepositLoanRoutesProps, RouteProps {
  feature: CreditAppetiteDepositLoanFeature
}

export const DepositLoanRoutes = (props: IProps) => {
  const { isFinancialInstitution, feature } = props

  if (isFinancialInstitution === null) {
    return null
  }
  if (isFinancialInstitution) {
    return (
      <Switch>
        <Route
          path={ROUTES[feature].financialInstitution.new}
          exact={true}
          render={() => <CreateOrEditDepositLoan feature={feature} />}
        />
        <Route
          path={ROUTES[feature].financialInstitution.requestInfo}
          render={() => <CreateOrEditDepositLoan feature={feature} />}
        />
        <Route
          path={ROUTES[feature].financialInstitution.edit}
          render={() => <CreateOrEditDepositLoan feature={feature} />}
        />
        <Route path={ROUTES[feature].financialInstitution.view} render={() => <ViewDepositLoan feature={feature} />} />
        <Route
          path={ROUTES[feature].financialInstitution.dashboard}
          exact={true}
          render={() => <DepositLoanDashboard feature={feature} />}
        />
      </Switch>
    )
  } else {
    return (
      <Switch>
        <Route
          path={ROUTES[feature].corporate.dashboard}
          exact={true}
          render={() => <DepositLoanSummariesDashboard feature={feature} />}
        />
        <Route
          path={ROUTES[feature].corporate.requestInfoUpdate}
          render={() => <RequestInformation feature={feature} />}
        />
        <Route
          path={ROUTES[feature].corporate.requestInfoNew}
          render={() => <RequestInformation feature={feature} />}
        />
        <Route
          path={ROUTES[feature].corporate.view}
          render={() => <DepositLoanCurrencyAndTenorDetails feature={feature} />}
        />
      </Switch>
    )
  }
}

const mapStateToProps = (state: ApplicationState): IDepositLoanRoutesProps => {
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

export default connect(mapStateToProps)(DepositLoanRoutes)
