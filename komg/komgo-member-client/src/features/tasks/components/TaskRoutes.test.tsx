import { shallow } from 'enzyme'
import { Route } from 'react-router-dom'
import * as React from 'react'

import TaskRoutes from './TaskRoutes'
import TaskView from './TaskView'

describe('TaskRoutes', () => {
  it('renders route to TaskView component', () => {
    const component = shallow(<TaskRoutes />)
    const route = component.find(Route)
    expect(route.get(0).props).toMatchObject({
      exact: true,
      path: '/tasks/:id',
      component: TaskView
    })
  })
})
