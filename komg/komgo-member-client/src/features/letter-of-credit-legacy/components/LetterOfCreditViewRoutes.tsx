import { Route, Switch } from 'react-router'
import * as React from 'react'
import { LetterOfCreditView } from '../containers'
import LetterOfCreditAmendment from '../containers/CreateAmendment'

const LetterOfCreditViewRoutes = () => {
  return (
    <Switch>
      <Route path="/financial-instruments/letters-of-credit/:id" exact={true} component={LetterOfCreditView} />
      <Route path="/financial-instruments/letters-of-credit/:id/amendments/new" component={LetterOfCreditAmendment} />
    </Switch>
  )
}

export default LetterOfCreditViewRoutes
