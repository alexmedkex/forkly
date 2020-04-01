import * as immutable from 'immutable'
import { Reducer, AnyAction } from 'redux'

import { TaskManagementState, TaskStateProperties, TaskManagementActionType } from './types'

const initialTaskState: TaskStateProperties = {
  availableUsers: [],
  tasks: [],
  tasksError: '',
  tasksFetching: false,
  task: null,
  taskError: null,
  taskFetching: false,
  profile: {
    id: '',
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    createdAt: 0,
    company: ''
  },
  taskInModal: null
}

export const initialTaskManagementState: TaskManagementState = immutable.Map(initialTaskState)

const reducer: Reducer<TaskManagementState> = (
  state: TaskManagementState = initialTaskManagementState,
  action: AnyAction
): TaskManagementState => {
  switch (action.type) {
    case TaskManagementActionType.TASKS_FETCHING:
      return state
        .set('tasksFetching', true)
        .set('tasks', [])
        .set('tasksError', null)
    case TaskManagementActionType.TASKS_SUCCESS:
      return state.set('tasksFetching', false).set('tasks', action.payload)
    case TaskManagementActionType.TASKS_FAILURE:
      return state.set('tasksFetching', false).set('tasksError', action.payload)
    case TaskManagementActionType.TASK_FETCHING:
      return state
        .set('taskFetching', true)
        .set('task', null)
        .set('taskError', null)
    case TaskManagementActionType.TASK_SUCCESS:
      return state.set('taskFetching', false).set('task', action.payload)
    case TaskManagementActionType.TASK_REPLACE: {
      const tasks = state.get('tasks').map(obj => (action.payload.task._id === obj.task._id ? action.payload : obj))
      return state.set('tasks', tasks)
    }
    case TaskManagementActionType.TASK_FAILURE:
      return state.set('taskFetching', false).set('taskError', action.payload)
    case TaskManagementActionType.SET_TASK_IN_MODAL:
      return state.set('taskInModal', action.payload)
    case TaskManagementActionType.NEW_TASK:
      return state.set('tasks', [action.payload, ...state.get('tasks')])
    default:
      return state
  }
}

export default reducer
