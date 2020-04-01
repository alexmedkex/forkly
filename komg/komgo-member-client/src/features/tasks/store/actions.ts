import { NOTIFICATIONS_BASE_ENDPOINT } from '../../../utils/endpoints'
import { HttpRequest } from '../../../utils/http'
import { ToastContainerIds } from '../../../utils/toast'
import { ThunkAction } from 'redux-thunk'
import { Action, ActionCreator } from 'redux'
import { TaskManagementActionType, TaskWithUser, SetTaskInModal } from './types'
import { UIState } from '../../../store/common/types'
import { toast } from 'react-toastify'

export interface TaskReplaceError extends Action {
  type: string
  payload: TaskWithUser
}

export interface TaskReplaceSuccess extends Action {
  type: string
  payload: TaskWithUser
}

export type ActionThunk = ThunkAction<void, UIState, HttpRequest>

export const getTasks: ActionCreator<ActionThunk> = (params: any = {}) => (dispatch, _, api) => {
  const action = api.get(`${NOTIFICATIONS_BASE_ENDPOINT}/tasks`, {
    type: TaskManagementActionType.TASKS_REQUEST,
    params,
    onSuccess: TaskManagementActionType.TASKS_SUCCESS,
    onError: TaskManagementActionType.TASKS_FAILURE
  })
  dispatch(action)
}

export const getTask: ActionCreator<ActionThunk> = (id: string) => (dispatch, _, api) => {
  dispatch({ type: TaskManagementActionType.TASK_FETCHING })
  const action = api.get(`${NOTIFICATIONS_BASE_ENDPOINT}/tasks/${id}`, {
    onSuccess: TaskManagementActionType.TASK_SUCCESS,
    onError: TaskManagementActionType.TASK_FAILURE
  })
  dispatch(action)
}

export const replaceError: ActionCreator<TaskReplaceError> = (payload: TaskWithUser) => {
  toast.error('Task reassigned error', { containerId: ToastContainerIds.Default })
  return {
    type: TaskManagementActionType.TASK_FAILURE,
    payload
  }
}

export const replace: ActionCreator<TaskReplaceSuccess> = (payload: TaskWithUser) => {
  toast.success(`Task reassigned to ${payload.user ? payload.user.username : 'Group'}`, {
    containerId: ToastContainerIds.Default
  })
  return {
    type: TaskManagementActionType.TASK_REPLACE,
    payload
  }
}

export const updateTaskAssignee: ActionCreator<ActionThunk> = (id: string, assignee?: string) => {
  return (dispatch: any, getState: any, api: any) => {
    return dispatch(
      api.patch(`${NOTIFICATIONS_BASE_ENDPOINT}/tasks/${id}/assignee`, {
        data: { assignee },
        onError: replaceError,
        onSuccess: replace
      })
    )
  }
}

export const setTaskInModal: ActionCreator<SetTaskInModal> = (payload: TaskWithUser | null) => ({
  type: TaskManagementActionType.SET_TASK_IN_MODAL,
  payload
})
