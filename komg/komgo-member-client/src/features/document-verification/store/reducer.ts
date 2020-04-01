import { Reducer } from 'redux'
import { fromJS, Map } from 'immutable'
import {
  DocumentVerificationActions,
  DocumentVerificationActionType,
  DocumentVerificationState,
  DocumentVerificationStateProperties,
  IStatus
} from './types'
import { grey, lightBlue, lightRed } from '../../../styles/colors'

const initialDocumentVerificationState: DocumentVerificationStateProperties = {
  registeredAt: 0,
  files: fromJS([])
}

export const initialState: DocumentVerificationState = Map(initialDocumentVerificationState)

const documentVerificationReducer: Reducer<DocumentVerificationState> = (
  state: DocumentVerificationState = initialState,
  action: DocumentVerificationActions
): DocumentVerificationState => {
  switch (action.type) {
    case DocumentVerificationActionType.VERIFY_DOCUMENT_ADD_FILE: {
      const { file } = action.payload
      const { key } = file
      const stateFiles = state.get('files').toJS()
      stateFiles[key] = file
      stateFiles[key].iconColor = grey

      return state.set('files', fromJS(stateFiles))
    }
    case DocumentVerificationActionType.VERIFY_DOCUMENT_REQUEST: {
      return state
    }
    case DocumentVerificationActionType.VERIFY_DOCUMENT_SUCCESS: {
      const { file, response } = action.payload
      const { documentInfo, registered, deactivated } = response
      const { key } = file
      const stateFiles = state.get('files').toJS()
      stateFiles[key] = file

      if (!(registered && !deactivated)) {
        stateFiles[key].status = IStatus.error
        stateFiles[key].iconColor = lightRed
        return state.set('files', fromJS(stateFiles))
      }

      const { registeredAt, registeredBy } = documentInfo
      stateFiles[key].status = IStatus.success
      stateFiles[key].iconColor = lightBlue
      stateFiles[key].registeredAt = registeredAt
      stateFiles[key].registeredBy = registeredBy

      return state.set('files', fromJS(stateFiles))
    }
    case DocumentVerificationActionType.VERIFY_DOCUMENT_FAILURE:
      const { file } = action.payload
      const { key } = file
      const stateFiles = state.get('files').toJS()
      stateFiles[key] = file
      stateFiles[key].status = IStatus.error
      stateFiles[key].iconColor = lightRed

      return state.set('files', fromJS(stateFiles))
    default:
      return state
  }
}

export default documentVerificationReducer
