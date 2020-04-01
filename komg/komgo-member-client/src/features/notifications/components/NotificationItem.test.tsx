import { shallow } from 'enzyme'
import * as React from 'react'

import { NotificationItem, NotificationItemProps } from './NotificationItem'
import { registerNotificationHandler } from './notificationHandlerProvider'
import { fakeTask } from '../../letter-of-credit-legacy/utils/faker'
import { LetterOfCreditTaskType } from '../../letter-of-credit-legacy/constants/taskType'
import { StandbyLetterOfCreditTaskType } from '@komgo/types'
import { Notification } from '../store/types'
import uuid from 'uuid'
import { TaskWithUser, TaskStatus, Task } from '../../tasks/store/types'
import { buildFakeNotification } from '../utils/faker'

const notification: Notification = buildFakeNotification()

let defaultProps: NotificationItemProps

const mockNotifRegType = 'mockNotifType'
const mockNotifNotRegType = 'mockNotifNotRegType'

const mockHistory = {
  push: jest.fn()
}

registerNotificationHandler(mockNotifRegType, (notification, mockHistory) => {
  mockHistory.push({
    pathname: `/mock-notification`
  })
})

describe('NotificationItem', () => {
  const mockTask: TaskWithUser = {
    task: {
      status: TaskStatus.ToDo
    } as Task
  }
  beforeEach(() => {
    defaultProps = {
      notification,
      markAsRead: jest.fn(),
      setSidebarExtended: jest.fn(),
      task: mockTask,
      history: {
        push: jest.fn()
      } as any,
      setTaskInModal: jest.fn(),
      location: {
        pathname: '',
        search: '',
        state: '',
        hash: ''
      },
      match: {
        isExact: true,
        path: '',
        url: '',
        params: {}
      },
      staticContext: null
    }
  })

  it('renders notification message', () => {
    const component = shallow(<NotificationItem {...defaultProps} />)
    expect(component.find({ children: notification.message }).length).toEqual(1)
  })

  it('calls markAsRead with correct arguments', () => {
    const component = shallow(<NotificationItem {...defaultProps} />)

    component.find('[data-test-id="notif-item"]').simulate('click')

    expect(defaultProps.markAsRead).toHaveBeenLastCalledWith(notification._id, true)
  })

  it('redirects to task if taskId is in the context object', () => {
    const props = {
      ...defaultProps,
      notification: buildFakeNotification({
        context: { type: 'TaskPayload', taskId: 'test-task-id' }
      })
    }
    const component = shallow(<NotificationItem {...props} />)

    component.find('[data-test-id="notif-item"]').simulate('click')

    expect(defaultProps.history.push).toHaveBeenLastCalledWith('/tasks/test-task-id')
  })

  it('redirects to received document review if receivedDocumentsId is in the context', () => {
    const props = {
      ...defaultProps,
      notification: buildFakeNotification({
        context: { type: 'ReceivedDocumentsContext', receivedDocumentsId: 'test-receivedDocuments-id' }
      })
    }
    const component = shallow(<NotificationItem {...props} />)

    component.find('[data-test-id="notif-item"]').simulate('click')

    expect(defaultProps.history.push).toHaveBeenLastCalledWith({
      pathname: '/review',
      state: { requestId: 'test-receivedDocuments-id' }
    })
  })

  it('redirects to mockNotifType route', () => {
    const props = {
      ...defaultProps,
      notification: buildFakeNotification({
        type: mockNotifRegType,
        context: {}
      })
    }
    const component = shallow(<NotificationItem {...props} />)

    component.find('[data-test-id="notif-item"]').simulate('click')

    expect(defaultProps.history.push).toHaveBeenLastCalledWith({
      pathname: '/mock-notification'
    })
  })

  it('does not redirects if type is not registrated', () => {
    const props = {
      ...defaultProps,
      notification: buildFakeNotification({
        type: mockNotifNotRegType,
        context: {}
      })
    }
    const component = shallow(<NotificationItem {...props} />)

    component.find('[data-test-id="notif-item"]').simulate('click')

    expect(defaultProps.history.push).not.toHaveBeenCalled()
  })

  it('does not redirect if taskId is not in the context', () => {
    const props = {
      ...defaultProps,
      notification: buildFakeNotification({
        context: null
      })
    }
    const component = shallow(<NotificationItem {...props} />)

    component.find('[data-test-id="notif-item"]').simulate('click')

    expect(defaultProps.history.push).not.toHaveBeenCalled()
  })

  it('call setTaskInModal if task should be handled in global modal', () => {
    const props = {
      ...defaultProps,
      task: { task: fakeTask({ type: LetterOfCreditTaskType.REVIEW_PRESENTATION_DISCREPANCIES }) }
    }

    const component = shallow(<NotificationItem {...props} />)

    component.find('[data-test-id="notif-item"]').simulate('click')

    expect(defaultProps.setTaskInModal).toHaveBeenCalledWith(props.task.task)
  })
  it(`redirects to sblc view if it is a notification of type StandbyLetterOfCreditTaskType.ReviewIssued with no taskId`, () => {
    const sblcStaticId = uuid.v4()

    const notification = buildFakeNotification({
      type: StandbyLetterOfCreditTaskType.ReviewIssued,
      context: {
        type: 'IStandbyLetterOfCredit',
        sblcStaticId
      }
    })

    const wrapper = shallow(<NotificationItem {...defaultProps} notification={notification} />)

    wrapper.find('[data-test-id="notif-item"]').simulate('click')

    expect(defaultProps.history.push).toHaveBeenCalledWith(
      `/financial-instruments/standby-letters-of-credit/${sblcStaticId}`
    )
  })
  it(`redirects to sblc view if it is a notification of type StandbyLetterOfCreditTaskType.ReviewRequested with no taskId`, () => {
    const sblcStaticId = uuid.v4()

    const notification = buildFakeNotification({
      type: StandbyLetterOfCreditTaskType.ReviewRequested,
      context: {
        type: 'IStandbyLetterOfCredit',
        sblcStaticId
      }
    })

    const wrapper = shallow(<NotificationItem {...defaultProps} notification={notification} task={undefined} />)

    wrapper.find('[data-test-id="notif-item"]').simulate('click')

    expect(defaultProps.history.push).toHaveBeenCalledTimes(1)
    expect(defaultProps.history.push).toHaveBeenCalledWith(
      `/financial-instruments/standby-letters-of-credit/${sblcStaticId}`
    )
  })
  it(`redirects to task and nowhere else if it is a notification of type StandbyLetterOfCreditTaskType.ReviewIssued with a task`, () => {
    const taskId = uuid.v4()

    const notification = buildFakeNotification({
      type: StandbyLetterOfCreditTaskType.ReviewRequested,
      context: {
        type: 'TaskPayload',
        taskId
      }
    })

    const wrapper = shallow(<NotificationItem {...defaultProps} notification={notification} />)

    wrapper.find('[data-test-id="notif-item"]').simulate('click')

    expect(defaultProps.history.push).toHaveBeenCalledTimes(1)
    expect(defaultProps.history.push).toHaveBeenCalledWith(`/tasks/${taskId}`)
  })
})
