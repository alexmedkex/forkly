import * as React from 'react'
import { Route, Switch } from 'react-router-dom'

import LetterOfCreditRoutes from '../../letter-of-credit-legacy/components/LetterOfCreditRoutes'
import FinancialInstruments from '../containers/FinancialInstruments'
import StandbyLetterOfCreditRoutes from '../../letter-of-credit-legacy/components/StandbyLetterOfCreditRoutes'

export const FinancialInstrumentsRoutes = () => (
  <Switch>
    <Route path="/financial-instruments" exact={true} component={FinancialInstruments} />
    <Route path="/financial-instruments/letters-of-credit" component={LetterOfCreditRoutes} />
    <Route path="/financial-instruments/standby-letters-of-credit" component={StandbyLetterOfCreditRoutes} />
  </Switch>
)

export default FinancialInstrumentsRoutes
