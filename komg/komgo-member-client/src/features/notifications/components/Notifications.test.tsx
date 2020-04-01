import { shallow } from 'enzyme'
import * as React from 'react'

import { ErrorMessage } from '../../../components'
import { Notifications } from './Notifications'
import NotificationItem from './NotificationItem'
import { TradeDashboard } from '../../trades/containers/TradeDashboard'
import { buildFakeError } from '../../../store/common/faker'

const notifications: any = [
  {
    _id: '_id',
    productId: 'productId',
    type: 'notif.type',
    createdAt: '2018-10-08T04:35:11.048Z',
    level: 'success',
    isRead: true,
    toUser: 'user-id',
    context: { taskId: 'test-task-id' },
    message: 'This is a notification message'
  }
]

let defaultProps: any

describe('Notifications', () => {
  beforeEach(() => {
    defaultProps = {
      unreadCount: 5,
      notificationsFetching: false,
      notifications,
      notificationsError: null,
      getNotifications: jest.fn(),
      getNotificationsCount: jest.fn(),
      getTasks: jest.fn()
    }
  })

  it('renders NotificationItem for each notification', () => {
    const props = {
      ...defaultProps,
      notifications: [notifications[0], notifications[0], notifications[0]]
    }

    const component = shallow(<Notifications {...props} />)

    expect(component.find(NotificationItem).length).toEqual(3)
  })

  it('renders ErrorMessage component if there is an error', () => {
    const notificationsError = 'test error message'
    const props = {
      ...defaultProps,
      notificationsError
    }

    const component = shallow(<Notifications {...props} />)
    const tree = component.find(ErrorMessage).html()
    expect(tree).toContain('Unable to load notifications')
    expect(tree).toContain(notificationsError)
  })

  it('renders "No notifications" message if there are no notifications', () => {
    const props = {
      ...defaultProps,
      notifications: []
    }

    const component = shallow(<Notifications {...props} />)

    expect(component.find({ children: "You don't have any notifications" }).length).toEqual(1)
  })
})
