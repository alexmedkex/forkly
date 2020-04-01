import { ActionCreator } from 'redux'

import { ModalActionType, ToggleModalVisible, SetModalStep, ModalName } from '../types'

export const toggleModalVisible: ActionCreator<ToggleModalVisible> = (modal: ModalName) => {
  return {
    type: ModalActionType.TOGGLE_MODAL_VISIBLE,
    modal
  }
}

export const setModalStep: ActionCreator<SetModalStep> = (modal: ModalName, step: number) => {
  return {
    type: ModalActionType.SET_MODAL_STEP,
    modal,
    step
  }
}
