import * as immutable from 'immutable'
import { Reducer } from 'redux'

import { NotificationAction, NotificationState, ActionType, NotificationStateFields, TypeContextEnum } from './types'

export const intialStateFields: NotificationStateFields = {
  unreadCount: 0,
  totalCount: 0,
  notificationsFetching: false,
  notificationFetching: false,
  notifications: [],
  notificationsError: null
}

export const initialState: NotificationState = immutable.Map(intialStateFields)

const resolveFetching = (type: ActionType) => {
  switch (type) {
    case ActionType.GET_NOTIFICATIONS_FETCHING: {
      return 'notificationsFetching'
    }
    case ActionType.GET_SINGLE_NOTIFICATION_REQUEST: {
      return 'notificationFetching'
    }
    default:
      return null
  }
}

const resolveError = (type: ActionType, state, action) => {
  switch (type) {
    case ActionType.GET_NOTIFICATIONS_ERROR: {
      return state
        .set('notificationsFetching', false)
        .set('notificationFetching', false)
        .set('notificationsError', action.payload)
        .set('notifications', [])
        .set('unreadCount', 0)
        .set('totalCount', 0)
    }
    case ActionType.GET_SINGLE_NOTIFICATION_ERROR: {
      return state.set('notificationFetching', false).set('notificationsError', action.payload)
    }
    default:
      return null
  }
}

const resolveSuccess = (type: ActionType, state, action) => {
  switch (type) {
    case ActionType.GET_SINGLE_NOTIFICATION_SUCCESS: {
      return state
        .set('notificationsFetching', false)
        .set('notificationFetching', false)
        .set('notificationsError', null)
        .set('notification', updateContexType(action.payload))
    }
    case ActionType.GET_NOTIFICATION_SUCCESS: {
      action.payload = updateContexType(action.payload)
      const unreadCount = state.get('unreadCount')
      const totalCount = state.get('unreadCount')
      const notifications = state.get('notifications')
      return state
        .set('unreadCount', unreadCount + 1)
        .set('totalCount', totalCount + 1)
        .set('notification', action.payload)
        .set('notifications', [action.payload, ...notifications])
    }
    case ActionType.GET_NOTIFICATIONS_SUCCESS: {
      const annotatedNotifs = action.payload.notifications.map(updateContexType)
      return state
        .set('unreadCount', action.payload.unread)
        .set('totalCount', action.payload.total)
        .set('notificationsFetching', false)
        .set('notificationsError', null)
        .set('notifications', annotatedNotifs)
    }
    default:
      return null
  }
}

const updateContexType = notif => {
  if (notif.context) {
    if ((notif.context as any).receivedDocumentsId) {
      notif.context.type = TypeContextEnum.ReceivedDocumentsContext
    } else if ((notif.context as any).taskId) {
      notif.context.type = TypeContextEnum.TaskPayload
    }
  }
  return notif
}

const reducer: Reducer<NotificationState> = (state = initialState, action: NotificationAction): NotificationState => {
  const fetching = resolveFetching(action.type)
  if (fetching) {
    return state.set(fetching, true)
  }

  const success = resolveSuccess(action.type, state, action)
  if (success) {
    return success
  }

  const error = resolveError(action.type, state, action)
  if (error) {
    return error
  }

  switch (action.type) {
    case ActionType.MARK_AS_READ: {
      let changed = false
      const notifications = state.get('notifications').map(notif => {
        if (notif._id === action.notificationId && notif.isRead !== action.isRead) {
          changed = true
          return {
            ...notif,
            isRead: action.isRead
          }
        }
        return notif
      })

      return changed
        ? state
            .set('notifications', notifications)
            .set('unreadCount', state.get('unreadCount') + (action.isRead ? -1 : 1))
        : state
    }
    case ActionType.MARK_ALL_AS_READ: {
      let changed = false
      const notifications = state.get('notifications').map(notif => {
        if (!notif.isRead) {
          changed = true
          return { ...notif, isRead: true }
        }
        return notif
      })

      return changed ? state.set('notifications', notifications).set('unreadCount', 0) : state
    }
    default:
      return state
  }
}

export default reducer
