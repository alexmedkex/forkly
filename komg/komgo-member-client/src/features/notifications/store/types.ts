import { Action } from 'redux'
import { ImmutableMap, stringOrNull } from '../../../utils/types'

export enum ActionType {
  GET_SINGLE_NOTIFICATION_REQUEST = '@@notif/GET_SINGLE_NOTIFICATION_REQUEST',
  GET_SINGLE_NOTIFICATION_SUCCESS = '@@notif/GET_SINGLE_NOTIFICATION_SUCCESS',
  GET_SINGLE_NOTIFICATION_ERROR = '@@notif/GET_SINGLE_NOTIFICATION_ERROR',
  GET_NOTIFICATIONS_FETCHING = '@@notif/GET_NOTIFICATIONS_FETCHING',
  GET_NOTIFICATIONS_SUCCESS = '@@notif/GET_NOTIFICATIONS_SUCCESS',
  GET_NOTIFICATIONS_ERROR = '@@notif/GET_NOTIFICATIONS_ERROR',
  GET_NOTIFICATION_SUCCESS = '@@notif/GET_NOTIFICATION_SUCCESS',
  MARK_AS_READ = '@@notif/MARK_AS_READ',
  MARK_ALL_AS_READ = '@@notif/MARK_ALL_AS_READ'
}

export enum TypeContextEnum {
  TaskPayload = 'TaskPayload',
  ReceivedDocumentsContext = 'ReceivedDocumentsContext'
}

export interface NotificationStateFields {
  unreadCount: number
  totalCount: number
  notificationsFetching: boolean
  notificationFetching?: boolean
  notifications: Notification[]
  notificationsError: stringOrNull
  notification?: Notification
}

export type NotificationState = ImmutableMap<NotificationStateFields>

export interface GetSingleNotificationRequest extends Action {
  type: ActionType.GET_SINGLE_NOTIFICATION_REQUEST
}

export interface GeSingleNotificationSuccess extends Action {
  type: ActionType.GET_SINGLE_NOTIFICATION_SUCCESS
  payload: Notification
}

export interface GetSingleNotificationError extends Action {
  type: ActionType.GET_SINGLE_NOTIFICATION_ERROR
  payload: string
}

export interface GetNotificationsFetching extends Action {
  type: ActionType.GET_NOTIFICATIONS_FETCHING
}

export interface GetNotificationsSuccess extends Action {
  type: ActionType.GET_NOTIFICATIONS_SUCCESS
  payload: {
    total: number
    unread: number
    notifications: Notification[]
  }
}

export interface GetNotificationsError extends Action {
  type: ActionType.GET_NOTIFICATIONS_ERROR
  payload: string
}

export interface GetNotificationSuccess extends Action {
  type: ActionType.GET_NOTIFICATION_SUCCESS
  payload: Notification
}

export interface MarkAsRead extends Action {
  type: ActionType.MARK_AS_READ
  notificationId: string
  isRead: boolean
}

export interface MarkAllAsRead extends Action {
  type: ActionType.MARK_ALL_AS_READ
}

export type NotificationAction =
  | GetNotificationSuccess
  | GetNotificationsSuccess
  | GetNotificationsError
  | GetNotificationsFetching
  | GetSingleNotificationRequest
  | GeSingleNotificationSuccess
  | MarkAsRead
  | MarkAllAsRead

export interface TaskPayload {
  type: TypeContextEnum.TaskPayload
  taskId: string
}

export interface ReceivedDocumentsContext {
  type: TypeContextEnum.ReceivedDocumentsContext
  receivedDocumentsId: string
}

export type Context = TaskPayload | ReceivedDocumentsContext | any

export interface Notification {
  _id: string
  productId: string
  type: string
  createdAt: string
  level: NotificationLevel
  isRead: boolean
  toUser: string
  context?: Context
  message: string
}

export type NotificationLevel = 'success' | 'info' | 'warning' | 'danger'
