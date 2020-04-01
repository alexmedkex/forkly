import * as React from 'react'
import { Switch, Route } from 'react-router'
import ReviewLcAmendmentTask from '../containers/ReviewLcAmendmentTask'

export const AmendmentRoutes = () => (
  <Switch>
    <Route path="/amendments/:amendmentId" component={ReviewLcAmendmentTask} />
  </Switch>
)

export default AmendmentRoutes
