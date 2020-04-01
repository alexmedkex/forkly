jest.mock('../../../utils/endpoints', () => ({
  NOTIFICATIONS_BASE_ENDPOINT: 'NOTIFICATIONS_BASE_ENDPOINT'
}))

import { getTasks, getTask, setTaskInModal } from './actions'
import { initialTaskManagementState } from './reducer'
import { TaskManagementActionType } from './types'
import { task } from './reducer.test'

describe('Task Actions', () => {
  let dispatchMock: any
  let apiMock: any
  const getState = (): any => initialTaskManagementState
  const httpGetAction = { type: '@http/API_REQUEST' }

  beforeEach(() => {
    dispatchMock = jest.fn()
    apiMock = {
      get: jest.fn(() => httpGetAction)
    }
  })

  describe('getTasks()', () => {
    it('calls api.get with correct arguments', () => {
      getTasks()(dispatchMock, getState, apiMock)

      expect(apiMock.get).toHaveBeenCalledWith('NOTIFICATIONS_BASE_ENDPOINT/tasks', {
        onSuccess: TaskManagementActionType.TASKS_SUCCESS,
        onError: TaskManagementActionType.TASKS_FAILURE,
        params: {},
        type: TaskManagementActionType.TASKS_REQUEST
      })
    })

    it('calls dispatch with the result of api.get() by getRoles actions', () => {
      getTasks()(dispatchMock, getState, apiMock)

      expect(dispatchMock).toHaveBeenCalledWith(httpGetAction)
    })
  })

  describe('getTask()', () => {
    it('dispatches TASK_FETCHING action', () => {
      getTask()(dispatchMock, getState, apiMock)

      expect(dispatchMock).toHaveBeenCalledWith({ type: TaskManagementActionType.TASK_FETCHING })
    })
    it('dispatches GET /tasks/:id request', () => {
      getTask('task-id')(dispatchMock, getState, apiMock)

      expect(dispatchMock).toHaveBeenCalledWith(httpGetAction)
    })
    it('calls api.get with correct arguments', () => {
      getTask('task-id')(dispatchMock, getState, apiMock)

      expect(apiMock.get).toHaveBeenCalledWith('NOTIFICATIONS_BASE_ENDPOINT/tasks/task-id', {
        onError: TaskManagementActionType.TASK_FAILURE,
        onSuccess: TaskManagementActionType.TASK_SUCCESS
      })
    })
  })

  describe('setTaskInModal()', () => {
    it('return appropriate object with task and type', () => {
      expect(setTaskInModal(task)).toEqual({
        type: TaskManagementActionType.SET_TASK_IN_MODAL,
        payload: task
      })
    })

    it('return appropriate object with null and type', () => {
      expect(setTaskInModal(null)).toEqual({
        type: TaskManagementActionType.SET_TASK_IN_MODAL,
        payload: null
      })
    })
  })
})
