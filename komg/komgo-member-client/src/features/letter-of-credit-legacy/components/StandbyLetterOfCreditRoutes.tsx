import * as React from 'react'
import { Route, Switch } from 'react-router-dom'

import CreateStandByLetterOfCredit from '../../standby-letter-of-credit-legacy/containers/CreateStandByLetterOfCredit'
import ViewStandbyLetterOfCredit from '../../standby-letter-of-credit-legacy/containers/ViewStandbyLetterOfCredit'

export const StandbyLetterOfCreditRoutes = () => (
  <Switch>
    <Route path="/financial-instruments/standby-letters-of-credit/new" component={CreateStandByLetterOfCredit} />
    <Route path="/financial-instruments/standby-letters-of-credit/:id" component={ViewStandbyLetterOfCredit} />
  </Switch>
)

export default StandbyLetterOfCreditRoutes
