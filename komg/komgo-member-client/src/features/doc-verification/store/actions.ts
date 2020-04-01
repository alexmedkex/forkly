import { ActionCreator } from 'redux'
import { MAGIC_LINK } from '../../../utils/endpoints'
import { DocumentVerificationActionType, DocVerificationState } from './types'
import { ThunkAction } from 'redux-thunk'
import { HttpRequest } from '../../../utils/http'

type ActionThunk = ThunkAction<void, DocVerificationState, HttpRequest>

export const getSession: ActionCreator<ActionThunk> = sessionId => (dispatch, _, api) => {
  dispatch(
    api.get(`${MAGIC_LINK}/session/${sessionId}`, {
      type: DocumentVerificationActionType.GET_SESSION_REQUEST,
      noAuth: true,
      onSuccess: DocumentVerificationActionType.GET_SESSION_SUCCESS,
      onError: DocumentVerificationActionType.GET_SESSION_FAILURE
    })
  )
}

export const verifyDocument: ActionCreator<ActionThunk> = (sessionId, merkleHash) => (dispatch, _, api) => {
  dispatch(
    api.post(`${MAGIC_LINK}/session/${sessionId}/verify`, {
      data: { merkleHash },
      noAuth: true,
      type: DocumentVerificationActionType.VERIFY_DOCUMENT_REQUEST,
      onSuccess: DocumentVerificationActionType.VERIFY_DOCUMENT_SUCCESS,
      onError: DocumentVerificationActionType.VERIFY_DOCUMENT_FAILURE
    })
  )
}
