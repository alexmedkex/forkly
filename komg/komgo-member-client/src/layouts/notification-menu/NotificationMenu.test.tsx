import { shallow } from 'enzyme'
import * as React from 'react'

import { NotificationMenu, NotificationHeader, CloseButton, MarkNotificationText } from './NotificationMenu'

describe('NotificationMenu Component', () => {
  let defaultProps: any

  beforeEach(() => {
    defaultProps = {
      notifications: [
        {
          _id: '_id',
          productId: 'productId',
          type: 'notif.type',
          createdAt: '2018-10-08T04:35:11.048Z',
          level: 'success',
          isRead: false,
          toUser: 'user-id',
          context: { taskId: 'test-task-id' },
          message: 'This is a notification message'
        }
      ],
      numberOfUnreadNotifications: 1,
      setSidebar: jest.fn()
    }
  })

  it('should render NotificationMenu component', () => {
    const wrapper = shallow(<NotificationMenu {...defaultProps} />)

    const result = wrapper.exists()

    expect(result).toBe(true)
  })

  it('should find Notification title', () => {
    const wrapper = shallow(<NotificationMenu {...defaultProps} />)

    const result = wrapper.find(NotificationHeader).exists()

    expect(result).toBe(true)
  })

  it('should call setSidebarExtended when close is clicked', () => {
    const wrapper = shallow(<NotificationMenu {...defaultProps} />)

    const close = wrapper.find(CloseButton)
    close.simulate('click')

    expect(defaultProps.setSidebar).toHaveBeenCalled()
  })

  it('Should render MarkNotificationText when number of unread notification is more then 0', () => {
    const wrapper = shallow(<NotificationMenu {...defaultProps} />)

    const markAllNotificationAsRead = wrapper.find(MarkNotificationText)

    expect(markAllNotificationAsRead.exists()).toBe(true)
  })
})
