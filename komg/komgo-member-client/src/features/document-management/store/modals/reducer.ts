import * as immutable from 'immutable'
import { Reducer } from 'redux'

import { ModalActionType, ModalState, ModalsState, ModalsStateFields, ModalAction, SteppedModalState } from '../types'

const simpleModalInitialState: ModalState = { visible: false }
const steppedModalInitialState: SteppedModalState = { visible: false, step: 0 }

export const initialModalStateFields: ModalsStateFields = {
  modals: {
    addDocument: simpleModalInitialState,
    shareDocument: steppedModalInitialState,
    addDocumentType: simpleModalInitialState,
    editDocumentType: simpleModalInitialState,
    newRequest: steppedModalInitialState,
    loadTemplate: simpleModalInitialState,
    deleteDocument: simpleModalInitialState,
    manageVerif: simpleModalInitialState
  }
}

export const initialState: ModalsState = immutable.fromJS(initialModalStateFields)

const reducer: Reducer<ModalsState> = (state = initialState, action: ModalAction): ModalsState => {
  switch (action.type) {
    case ModalActionType.TOGGLE_MODAL_VISIBLE: {
      const isVisible = state.getIn(['modals', action.modal, 'visible'])
      return state.setIn(['modals', action.modal, 'visible'], !isVisible)
    }
    case ModalActionType.SET_MODAL_STEP: {
      if (action.step < 0) {
        return state
      }
      const step = state.getIn(['modals', action.modal, 'step'], undefined)
      if (step === undefined) {
        return state
      }
      return state.setIn(['modals', action.modal, 'step'], action.step)
    }
    default:
      return state
  }
}

export default reducer
