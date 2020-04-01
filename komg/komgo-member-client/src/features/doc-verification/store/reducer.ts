import { Reducer } from 'redux'
import { fromJS, Map } from 'immutable'
import {
  DocumentVerificationActions,
  DocumentVerificationActionType,
  DocVerificationState,
  DocVerificationStateProperties
} from './types'

const initialDocVerificationState: DocVerificationStateProperties = {
  registeredAt: 0,
  companyName: '',
  metadataHash: ''
}

export const initialState: DocVerificationState = Map(initialDocVerificationState)

const docVerificationReducer: Reducer<DocVerificationState> = (
  state: DocVerificationState = initialState,
  action: DocumentVerificationActions
): DocVerificationState => {
  switch (action.type) {
    case DocumentVerificationActionType.GET_SESSION_SUCCESS:
      return state.set('metadataHash', fromJS(action.payload.metadataHash))
    case DocumentVerificationActionType.VERIFY_DOCUMENT_SUCCESS:
      return state
        .set('registeredAt', fromJS(+action.payload.registeredAt))
        .set('companyName', fromJS(action.payload.companyName))
    case DocumentVerificationActionType.VERIFY_DOCUMENT_FAILURE:
      return state.set('registeredAt', 0).set('companyName', '')
    default:
      return state
  }
}

export default docVerificationReducer
