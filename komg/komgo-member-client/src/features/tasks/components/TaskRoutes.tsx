import * as React from 'react'
import { Route, Switch } from 'react-router-dom'

import Tasks from './Tasks'
import TaskView from './TaskView'

export const TaskRoutes = () => (
  <Switch>
    <Route exact={true} path="/tasks/:id" component={TaskView} />
    <Route component={Tasks} />
  </Switch>
)

export default TaskRoutes
