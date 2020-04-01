import reducer, { initialTaskManagementState } from './reducer'
import { TaskManagementActionType, TaskStatus } from './types'

export const task: any = {
  _id: '1234',
  summary: 'Complete document request',
  taskType: 'LC.ReviewTradeDocs',
  status: TaskStatus.ToDo,
  counterpartyName: 'CitiBank',
  assignee: 'keycloakUserId',
  requiredPermission: { productId: 'id', actionId: 'actId' },
  context: {},
  createdAt: '2018-10-07T18:37:30.574Z',
  updatedAt: '2018-10-07T18:37:30.574Z',
  dueAt: '2018-10-07T18:37:30.574Z'
}

describe('Task Reducer', () => {
  it('sets tasks on TASKS_SUCCESS action type', () => {
    const action = {
      type: TaskManagementActionType.TASKS_SUCCESS,
      payload: {
        id: 'taskId',
        label: 'taskLabel',
        permittedActions: []
      }
    }

    const newState = reducer(initialTaskManagementState, action)

    expect(newState.get('tasks')).toEqual(action.payload)
  })

  it('filters tasks on Received Tasks action type', () => {
    const action = {
      type: TaskManagementActionType.TASKS_SUCCESS,
      payload: '2'
    }

    const newState = reducer(
      initialTaskManagementState.set('tasks', [{ ...task, _id: '1' }, { ...task, _id: '2' }, { ...task, _id: '3' }]),
      action
    )
    expect(newState.get('tasks')).toEqual('2')
  })

  it('sets error on TASKS_ERROR action type', () => {
    const action = {
      type: TaskManagementActionType.TASKS_FAILURE,
      payload: null
    }

    const newState = reducer(initialTaskManagementState, action)

    expect(newState.get('tasksError')).toEqual(action.payload)
  })

  it('sets taskFetching to true on TASK_FETCHING', () => {
    const newState = reducer(initialTaskManagementState, {
      type: TaskManagementActionType.TASK_FETCHING
    })

    expect(newState.get('taskFetching')).toEqual(true)
  })

  it('sets task to true on TASK_SUCCESS', () => {
    const newState = reducer(initialTaskManagementState, {
      type: TaskManagementActionType.TASK_SUCCESS,
      payload: task
    })

    expect(newState.get('task')).toEqual(task)
  })

  it('sets task to true on TASK_ERROR', () => {
    const newState = reducer(initialTaskManagementState, {
      type: TaskManagementActionType.TASK_FAILURE,
      payload: 'task error'
    })

    expect(newState.get('taskError')).toEqual('task error')
  })

  it('sets task to taskInModal', () => {
    const newState = reducer(initialTaskManagementState, {
      type: TaskManagementActionType.SET_TASK_IN_MODAL,
      payload: task
    })

    expect(newState.get('taskInModal')).toEqual(task)
  })

  it('sets task to null when null is given in taskInModal', () => {
    const newState = reducer(initialTaskManagementState, {
      type: TaskManagementActionType.SET_TASK_IN_MODAL,
      payload: null
    })

    expect(newState.get('taskInModal')).toEqual(null)
  })

  it('inserts a new task to the beginning of the list', () => {
    const initialTask = { ...task, _id: 'abc' }
    const state = initialTaskManagementState.set('tasks', [initialTask])

    const newState = reducer(state, {
      type: TaskManagementActionType.NEW_TASK,
      payload: task
    })

    expect(newState.get('tasks')).toEqual([task, initialTask])
  })
})
