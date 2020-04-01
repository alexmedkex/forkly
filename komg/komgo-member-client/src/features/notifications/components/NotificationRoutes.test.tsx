import { shallow } from 'enzyme'
import { Route } from 'react-router-dom'
import * as React from 'react'

import NotificationRoutes from './NotificationRoutes'
import NotificationView from './NotificationView'

describe('NotificationRoutes', () => {
  it('renders route to NotificationView component', () => {
    const component = shallow(<NotificationRoutes />)
    const route = component.find(Route)
    expect(route.get(0).props).toMatchObject({
      exact: true,
      path: '/notifications/:id',
      component: NotificationView
    })
  })
})
