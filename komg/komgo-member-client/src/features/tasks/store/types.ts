import { Action } from 'redux'
import { ImmutableMap, stringOrNull } from '../../../utils/types'
import { User } from '../../../store/common/types'

export enum TaskManagementActionType {
  TASKS_REQUEST = '@@tasks/TASKS_REQUEST',
  TASKS_SUCCESS = '@@tasks/TASKS_SUCCESS',
  TASKS_FAILURE = '@@tasks/TASKS_FAILURE',
  TASKS_FETCHING = '@@tasks/TASKS_FETCHING',
  TASK_FETCHING = '@@tasks/TASK_FETCHING',
  TASK_FAILURE = '@@tasks/TASK_FAILURE',
  TASK_SUCCESS = '@@tasks/TASK_SUCCESS',
  TASK_REPLACE = '@@task/TASK_REPLACE',
  SET_TASK_IN_MODAL = '@@task/SET_TASK_IN_MODAL',
  NEW_TASK = '@@tasks/NEW_TASK'
}

export enum TaskStatus {
  ToDo = 'To Do',
  InProgress = 'In Progress',
  Done = 'Done'
}

export interface PermittedAction {
  productId: string
  actionId: string
}

export interface TaskWithUser {
  task: Task
  user?: User
}

export type TaskManagementState = ImmutableMap<TaskStateProperties>

export interface TaskViewProperties {
  task: TaskWithUser | null
  taskFetching: boolean
  taskError: stringOrNull
}

export interface TaskListProperties {
  tasks: TaskWithUser[]
  tasksError: stringOrNull
  tasksFetching: boolean
  profile: User
  availableUsers: User[]
  taskInModal: Task | null
}

export type TaskStateProperties = TaskListProperties & TaskViewProperties

export interface Task {
  _id: string
  summary: string
  taskType: string
  status: TaskStatus
  counterpartyName?: string
  counterpartyStaticId?: string
  assignee?: string // user ID from Keycloak or null if unassigned
  requiredPermission: RequiredPermission
  context: TaskContext
  actions: any[]
  outcome?: boolean
  comment?: string
  createdAt: string
  updatedAt: string
  dueAt?: string
}

export interface RequiredPermission {
  productId: string
  actionId: string
}

export type TaskContext = any

export interface TasksFetchingAction extends Action {
  type: TaskManagementActionType.TASKS_FETCHING
}

export interface TasksSuccessAction extends Action {
  type: TaskManagementActionType.TASKS_SUCCESS
  payload: TaskWithUser[]
}

export interface TasksError extends Action {
  type: TaskManagementActionType.TASKS_FAILURE
  payload: string
}

export interface TaskFetching extends Action {
  type: TaskManagementActionType.TASK_FETCHING
}

export interface TaskError extends Action {
  type: TaskManagementActionType.TASK_FAILURE
  payload: string
}

export interface TaskSuccess extends Action {
  type: TaskManagementActionType.TASK_SUCCESS
  payload: TaskWithUser
}

export interface TaskReplace extends Action {
  type: TaskManagementActionType.TASK_REPLACE
  payload: TaskWithUser
}

export interface NewTask extends Action {
  type: TaskManagementActionType.NEW_TASK
  payload: TaskWithUser
}

export enum TaskContextType {
  LC = 'LC',
  LCPresentation = 'LCPresentation'
}

export interface SetTaskInModal extends Action {
  type: TaskManagementActionType.SET_TASK_IN_MODAL
  payload: TaskWithUser | null
}

export type TasksManagementActions =
  | TaskReplace
  | TasksFetchingAction
  | TasksSuccessAction
  | TasksError
  | TaskFetching
  | TaskError
  | TaskSuccess
  | NewTask
