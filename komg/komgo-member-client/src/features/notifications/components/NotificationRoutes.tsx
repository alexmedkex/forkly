import * as React from 'react'
import { Route, Switch } from 'react-router-dom'

import Notifications from './Notifications'
import NotificationView from './NotificationView'

export const NotificationRoutes = () => (
  <Switch>
    <Route exact={true} path="/notifications/:id" component={NotificationView} />
    <Route component={Notifications} />
  </Switch>
)

export default NotificationRoutes
