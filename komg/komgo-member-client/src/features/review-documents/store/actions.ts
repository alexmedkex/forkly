import { ActionCreator, Action } from 'redux'
import { ThunkAction } from 'redux-thunk'
import { ApplicationState } from '../../../store/reducers'
import { HttpRequest } from '../../../utils/http'
import { DOCUMENTS_BASE_ENDPOINT, TRADE_FINANCE_BASE_ENDPOINT } from '../../../utils/endpoints'
import { ToastContainerIds } from '../../../utils/toast'
import {
  ActionType,
  FetchDocumentsReceivedSuccess,
  FetchDocumentsReceivedError,
  IFullReceivedDocumentsResponse,
  FetchContentDocumentSuccess,
  FetchContentDocumentError,
  PostCompleteDocumentsReviewError,
  PostCompleteDocumentsReviewSuccess,
  PatchDocumentsReviewSuccess,
  PatchDocumentsReviewError,
  IFullDocumentReviewResponse,
  UpdateStatus
} from './types'
import { fetchDocumentContentAsync } from '../../document-management/store/documents/actions'
import { displayToast, TOAST_TYPE } from '../../../features/toasts/utils'

export type ActionThunk = ThunkAction<Action, ApplicationState, HttpRequest>

// Retrieve the list of documents associated with one receivedDocument request

export const fetchDocumentsReceivedAsync: ActionCreator<ActionThunk> = (
  idReceivedDocumentsRequest: string,
  productId: string = 'kyc'
) => {
  return (dispatch, getState, api): Action => {
    const receivedDocumentsId = idReceivedDocumentsRequest
    return dispatch(
      api.get(`${DOCUMENTS_BASE_ENDPOINT}/products/${productId}/received-documents/${receivedDocumentsId}`, {
        onError: fetchDocumentsReceivedError,
        onSuccess: fetchDocumentsReceivedSuccess
      })
    )
  }
}

export const fetchDocumentsReceivedSuccess: ActionCreator<FetchDocumentsReceivedSuccess> = (
  request: IFullReceivedDocumentsResponse
) => ({
  type: ActionType.FETCH_DOCUMENTS_RECEIVED_SUCCESS,
  payload: request
})

export const fetchDocumentsReceivedError: ActionCreator<FetchDocumentsReceivedError> = error => ({
  type: ActionType.FETCH_DOCUMENTS_RECEIVED_ERROR,
  error
})

// Retrieve list of submitted documents for lc presentation

export const fetchLCPresentationSubmittedDocWithDocContent: ActionCreator<ActionThunk> = (
  lcId: string,
  presentationId: string,
  documentId?: string
) => {
  return (dispatch, getState, api): Action => {
    return dispatch(
      api.get(`${TRADE_FINANCE_BASE_ENDPOINT}/lc/${lcId}/presentations/${presentationId}/documents-feedback`, {
        type: ActionType.FETCH_SUBMITTED_DOCUMENTS_REQUEST,
        onError: ActionType.FETCH_SUBMITTED_DOCUMENTS_FAILURE,
        onSuccess: response => {
          if (response && response.documents && response.documents.length) {
            fetchDocumentContentAsync(documentId || response.documents[0].document.id, 'tradeFinance')(
              dispatch,
              getState,
              api
            )
          }
          return {
            payload: response,
            type: ActionType.FETCH_SUBMITTED_DOCUMENTS_SUCCESS
          }
        }
      })
    )
  }
}

// Reply to the counterparty with the result of the revision

export const postCompleteDocumentReviewAsync: ActionCreator<ActionThunk> = (idReceivedDocumentsRequest: string) => {
  return (dispatch, getState, api): Action => {
    const productId = 'kyc'
    return dispatch(
      api.post(
        `${DOCUMENTS_BASE_ENDPOINT}/products/${productId}/received-documents/${idReceivedDocumentsRequest}/send-feedback`,
        {
          onError: postCompleteDocumentReviewError,
          onSuccess: postCompleteDocumentReviewSuccess
        }
      )
    )
  }
}

export const postCompleteDocumentReviewSuccess: ActionCreator<PostCompleteDocumentsReviewSuccess> = () => {
  displayToast('Document review completed', TOAST_TYPE.Ok)
  return {
    type: ActionType.POST_COMPLETE_DOCUMENTS_REVIEW_SUCCESS
  }
}

export const postCompleteDocumentReviewError: ActionCreator<PostCompleteDocumentsReviewError> = error => {
  displayToast(`Error submitting document review: ${error}`, TOAST_TYPE.Error)
  return {
    type: ActionType.POST_COMPLETE_DOCUMENTS_REVIEW_ERROR,
    error
  }
}

// Update document review status

export const patchDocumentsReviewAsync: ActionCreator<ActionThunk> = (
  idReceivedDocumentsRequest: string,
  documentsReviewed: IFullDocumentReviewResponse[],
  productId: string = 'kyc'
) => {
  return (dispatch, getState, api): Action => {
    return dispatch(
      api.patch(
        `${DOCUMENTS_BASE_ENDPOINT}/products/${productId}/received-documents/${idReceivedDocumentsRequest}/documents`,
        {
          data: {
            documents: documentsReviewed.map(doc => ({
              documentId: doc.document.id,
              status: doc.status,
              note: doc.note
            }))
          },
          onError: patchDocumentsReviewError,
          onSuccess: patchDocumentsReviewSuccess
        }
      )
    )
  }
}

export const patchDocumentsReviewSuccess: ActionCreator<PatchDocumentsReviewSuccess> = (status: UpdateStatus) => ({
  type: ActionType.PATCH_DOCUMENTS_REVIEW_SUCCESS,
  payload: status
})

export const patchDocumentsReviewError: ActionCreator<PatchDocumentsReviewError> = error => ({
  type: ActionType.PATCH_DOCUMENTS_REVIEW_ERROR,
  error
})

export const fetchPresentationDocumentsReceived = (lcId: string, presentationId: string) => (
  dispatch,
  getState,
  api
): Action => {
  return dispatch(
    api.get(`${TRADE_FINANCE_BASE_ENDPOINT}/lc/${lcId}/presentations/${presentationId}/received-documents`, {
      onError: fetchDocumentsReceivedError,
      onSuccess: response => {
        // TODO: This will be fixed in api response
        const receivedDocs = response && response.length ? response[0] : response
        return fetchDocumentsReceivedSuccess(receivedDocs)
      }
    })
  )
}
