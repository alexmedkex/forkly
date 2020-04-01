import { ActionCreator } from 'redux'
import { MAGIC_LINK } from '../../../utils/endpoints'
import { DocumentVerificationActionType, DocumentVerificationState } from './types'
import { ThunkAction } from 'redux-thunk'
import { HttpRequest } from '../../../utils/http'

type ActionThunk = ThunkAction<void, DocumentVerificationState, HttpRequest>

export const verifyDocument: ActionCreator<ActionThunk> = file => (dispatch, _, api) => {
  dispatch({ type: DocumentVerificationActionType.VERIFY_DOCUMENT_ADD_FILE, payload: { file } })
  dispatch(
    api.get(`${MAGIC_LINK}/documents/${file.hash}`, {
      noAuth: true,
      type: DocumentVerificationActionType.VERIFY_DOCUMENT_REQUEST,
      onError(response) {
        return { type: DocumentVerificationActionType.VERIFY_DOCUMENT_FAILURE, payload: { file, response } }
      },
      onSuccess(response) {
        return { type: DocumentVerificationActionType.VERIFY_DOCUMENT_SUCCESS, payload: { file, response } }
      }
    })
  )
}
