import { Action } from 'redux'

export type ModalName =
  | 'addDocument'
  | 'shareDocument'
  | 'addDocumentType'
  | 'editDocumentType'
  | 'newRequest'
  | 'loadTemplate'
  | 'deleteDocument'
  | 'createLinkDocument'
  | 'revokeLinkDocument'
  | 'manageLinkDocument'
  | 'manageVerif'

export enum ModalActionType {
  TOGGLE_MODAL_VISIBLE = '@@docs/TOGGLE_MODAL_VISIBLE',
  SET_MODAL_STEP = '@@docs/SET_MODAL_STEP'
}

export interface ToggleModalVisible extends Action {
  type: ModalActionType.TOGGLE_MODAL_VISIBLE
  modal: ModalName
}

export interface SetModalStep extends Action {
  type: ModalActionType.SET_MODAL_STEP
  modal: ModalName
  step: number
}

export type ModalAction = ToggleModalVisible | SetModalStep
