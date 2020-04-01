import * as React from 'react'
import { Redirect, Route, Switch } from 'react-router-dom'
import CreateLetterOfCreditContainer from '../containers/CreateLetterOfCreditContainer'
import ViewLetterOfCreditContainer from '../containers/ViewLetterOfCreditContainer'
import ViewLetterOfCreditTradeContainer from '../containers/ViewLetterOfCreditTradeContainer'
import LetterOfCreditDashboardContainer from '../containers/LetterOfCreditDashboardContainer'

export const LettersOfCreditRoutes = () => (
  <Switch>
    <Route
      exact={true}
      path="/letters-of-credit"
      render={() => <Redirect to="/letters-of-credit/dashboard/standby" />}
    />
    <Route
      exact={true}
      path="/letters-of-credit/dashboard"
      render={() => <Redirect to="/letters-of-credit/dashboard/standby" />}
    />
    <Route path="/letters-of-credit/dashboard/:type" exact={true} component={LetterOfCreditDashboardContainer} />
    <Route path="/letters-of-credit/new" component={CreateLetterOfCreditContainer} />
    <Route path="/letters-of-credit/:staticId" exact={true} component={ViewLetterOfCreditContainer} />
    <Route path="/letters-of-credit/:staticId/trade" component={ViewLetterOfCreditTradeContainer} />
  </Switch>
)

export default LettersOfCreditRoutes
