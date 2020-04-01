import { ActionCreator, Action } from 'redux'
import { ThunkAction } from 'redux-thunk'
import { toast } from 'react-toastify'
import { ApplicationState } from '../../../store/reducers'
import { HttpRequest } from '../../../utils/http'
import { NOTIFICATIONS_BASE_ENDPOINT } from '../../../utils/endpoints'
import { ToastContainerIds } from '../../../utils/toast'

import { ActionType, MarkAsRead } from './types'

const actionTypeThatDoesNothing = 'do-nothing'

const toastAnError = (e: string) =>
  toast.error(`Error occurred while processing the request. Please try again later. ${e}`, {
    containerId: ToastContainerIds.Default
  })

export type ActionThunk = ThunkAction<void, ApplicationState, HttpRequest>

export const getNotifications: ActionCreator<ActionThunk> = (offset: number = 0, limit: number = 5) => (
  dispatch,
  _,
  api
) => {
  dispatch({ type: ActionType.GET_NOTIFICATIONS_FETCHING })
  dispatch(
    api.get(`${NOTIFICATIONS_BASE_ENDPOINT}/notifications?offset=${offset}&limit=${limit}`, {
      onSuccess: ActionType.GET_NOTIFICATIONS_SUCCESS,
      onError: ActionType.GET_NOTIFICATIONS_ERROR
    })
  )
}

export const getNotification: ActionCreator<ActionThunk> = (id: string) => (dispatch, _, api) => {
  dispatch({ type: ActionType.GET_SINGLE_NOTIFICATION_REQUEST })
  dispatch(
    api.get(`${NOTIFICATIONS_BASE_ENDPOINT}/notifications/${id}`, {
      onSuccess: ActionType.GET_SINGLE_NOTIFICATION_SUCCESS,
      onError: ActionType.GET_SINGLE_NOTIFICATION_ERROR
    })
  )
}

export const markAsRead: ActionCreator<ActionThunk> = (notificationId: string, isRead: boolean) => (
  dispatch,
  _,
  api
) => {
  dispatch({
    type: ActionType.MARK_AS_READ,
    notificationId,
    isRead
  })

  dispatch(
    api.patch(`${NOTIFICATIONS_BASE_ENDPOINT}/notifications/is-read/${notificationId}`, {
      data: { isRead },
      onSuccess: actionTypeThatDoesNothing,
      onError(e): MarkAsRead {
        toastAnError(e)
        // Revert UI state back to previous
        return { type: ActionType.MARK_AS_READ, notificationId, isRead: !isRead }
      }
    })
  )
}

export const markAllAsRead: ActionCreator<ActionThunk> = () => (dispatch, _, api) => {
  dispatch({ type: ActionType.MARK_ALL_AS_READ })

  dispatch(
    api.patch(`${NOTIFICATIONS_BASE_ENDPOINT}/notifications/is-read`, {
      data: { isRead: true },
      onSuccess: actionTypeThatDoesNothing,
      onError(e) {
        toastAnError(e)
        return { type: actionTypeThatDoesNothing }
      }
    })
  )
}
