import reducer, { initialState } from './reducer'
import { ActionType } from './types'

const notification: any = {
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

describe('Notification Reducer', () => {
  it('sets notification on GET_NOTIFICATIONS_SUCCESS action type', () => {
    const action = {
      type: ActionType.GET_NOTIFICATIONS_SUCCESS,
      payload: {
        total: 1,
        unread: 1,
        notifications: [notification]
      }
    }

    const newState = reducer(initialState, action)

    expect(newState.get('notifications')).toEqual(action.payload.notifications)
    expect(newState.get('unreadCount')).toEqual(action.payload.unread)
  })

  it('sets notificationsFetching to true on GET_NOTIFICATIONS_FETCHING', () => {
    const action = {
      type: ActionType.GET_NOTIFICATIONS_FETCHING
    }

    const newState = reducer(initialState, action)

    expect(newState.get('notificationsFetching')).toEqual(true)
  })

  it('sets notificationsError to true on GET_NOTIFICATIONS_ERROR', () => {
    const action = {
      type: ActionType.GET_NOTIFICATIONS_ERROR,
      payload: 'error message'
    }

    const newState = reducer(initialState, action)

    expect(newState.get('notificationsError')).toEqual('error message')
  })

  it('marks notification as read on GET_NOTIFICATIONS_ERROR', () => {
    const action = {
      type: ActionType.MARK_AS_READ,
      notificationId: '3',
      isRead: true
    }

    const newState = reducer(
      initialState.set('notifications', [
        { ...notification, _id: '1' },
        { ...notification, _id: '2' },
        { ...notification, _id: '3' },
        { ...notification, _id: '4' }
      ]),
      action
    )

    const readNotif = newState.get('notifications').filter(n => n.isRead)[0]
    expect(readNotif._id).toEqual('3')
  })

  it('returns unmodified state by default', () => {
    const action = {
      type: 'uknown action'
    }

    const newState = reducer(initialState, action)

    expect(newState).toEqual(initialState)
  })

  it('marks all notifications as read', () => {
    const action = {
      type: ActionType.MARK_ALL_AS_READ,
      notificationId: '3',
      isRead: false
    }

    const newState = reducer(
      initialState.set('notifications', [
        { ...notification, _id: '1' },
        { ...notification, _id: '2' },
        { ...notification, _id: '3' },
        { ...notification, _id: '4' }
      ]),
      action
    )

    const readNotif = newState.get('notifications').filter(n => n.isRead)
    expect(readNotif.length).toEqual(4)
  })
})
