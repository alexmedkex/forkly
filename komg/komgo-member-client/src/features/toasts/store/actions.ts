import { displayToast, TOAST_TYPE } from '../utils'
import { AnyAction, ActionCreator } from 'redux'
import { ToastActionType } from './types'

export interface CreateToast extends AnyAction {
  type: ToastActionType.CREATE_TOAST
}

export const createToast: ActionCreator<CreateToast> = (msg: string, status?: TOAST_TYPE) => {
  displayToast(msg, status)
  return {
    type: ToastActionType.CREATE_TOAST
  }
}
