import { ImmutableMap } from '../../../utils/types'

export type ToastState = ImmutableMap<ToastInitialStateFields>

export interface ToastInitialStateFields {
  message: string
}

export enum ToastActionType {
  CREATE_TOAST = '@@toast/CREATE_TOAST'
}
