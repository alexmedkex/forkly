import * as React from 'react'
import { Route, Switch } from 'react-router-dom'
import CreateTemplateContainer from '../containers/EditTemplateContainer'
import TemplateDashboardContainer from '../containers/TemplateDashboardContainer'

export const TemplateRoutes = () => (
  <Switch>
    <Route path="/templates" component={TemplateDashboardContainer} exact={true} />
    <Route path="/templates/:staticId" component={CreateTemplateContainer} />
  </Switch>
)
