import { ThunkAction } from 'redux-thunk'
import { Action, ActionCreator, AnyAction } from 'redux'
import { HttpRequest } from '../../../../utils/http'
import { TRADE_FINANCE_BASE_ENDPOINT } from '../../../../utils/endpoints'
import { ToastContainerIds } from '../../../../utils/toast'
import {
  LCPresentationActionType,
  LCPresentationCreateError,
  LCPresentationRemoveSuccess,
  SubmitPresentation,
  LCPresentationSubmitSuccess,
  LCPresentationDocumentsCompliantSuccess,
  LCPresentationDocumentsDiscrepantSuccess,
  LCPresentationRequestWaiverOfDicrepanciesSuccess
} from './types'
import { ApplicationState } from '../../../../store/reducers'
import { toast } from 'react-toastify'
import { DocumentResponse } from '../../../document-management'
import { CreateLetterOfCreditDocumentRequest } from '../types'
import { getEndpointError } from '../../../../utils/error-handler'
import { ILCPresentation } from '../../types/ILCPresentation'
import { history } from '../../../../store/history'
import { DiscrepantForm } from '../../components/presentation/ReviewPresentationDocumentsForm'
import { CommentForm } from '../../containers/presentation/ReviewRequestedDiscrepancies'
import { setTaskInModal } from '../../../tasks/store/actions'

export type ActionThunk = ThunkAction<Action, ApplicationState, HttpRequest>

export type LCPresentationActionThunk = ThunkAction<Action, ApplicationState, HttpRequest>
export type LCPresentationActionThunkWithAnyState = ThunkAction<Action, any, HttpRequest>

export const createPresentation: ActionCreator<LCPresentationActionThunk> = (lcId: string) => (
  dispatch,
  _,
  api
): Action => {
  return dispatch(
    api.post(`${TRADE_FINANCE_BASE_ENDPOINT}/lc/${lcId}/presentations`, {
      type: LCPresentationActionType.CREATE_PRESENTATION_REQUEST,
      onSuccess: LCPresentationActionType.CREATE_PRESENTATION_SUCCESS,
      onError: createPresentationError
    })
  )
}

export const fetchPresentationDocuments: ActionCreator<LCPresentationActionThunkWithAnyState> = (
  lcId: string,
  presentationId: string
) => (dispatch, _, api): Action => {
  return dispatch(
    api.get(`${TRADE_FINANCE_BASE_ENDPOINT}/lc/${lcId}/presentations/${presentationId}/documents`, {
      type: LCPresentationActionType.FETCH_PRESENTATION_DOCUMENTS_REQUEST,
      onSuccess: {
        type: LCPresentationActionType.FETCH_PRESENTATION_DOCUMENTS_SUCCESS,
        presentationId
      },
      onError: LCPresentationActionType.FETCH_PRESENTATION_DOCUMENTS_FAILURE
    })
  )
}

export const fetchVaktDocuments: ActionCreator<LCPresentationActionThunkWithAnyState> = (
  lcId: string,
  presentationId: string
) => (dispatch, _, api): Action => {
  return dispatch(
    api.get(`${TRADE_FINANCE_BASE_ENDPOINT}/lc/${lcId}/presentations/${presentationId}/vaktDocuments`, {
      type: LCPresentationActionType.FETCH_VAKT_DOCUMENTS_REQUEST,
      onSuccess: {
        type: LCPresentationActionType.FETCH_VAKT_DOCUMENTS_SUCCESS,
        presentationId
      },
      onError: LCPresentationActionType.FETCH_VAKT_DOCUMENTS_FAILURE
    })
  )
}

export const attachVaktDocuments: ActionCreator<LCPresentationActionThunkWithAnyState> = (
  lcId: string,
  presentationId: string,
  ids: string[]
) => {
  return (dispatch: any, getState: () => ApplicationState, api: any) => {
    const request = ids
    const lcReference = getState()
      .get('lettersOfCredit')
      .get('byId')
      .toJS()[lcId].reference
    return dispatch(
      api.put(`${TRADE_FINANCE_BASE_ENDPOINT}/lc/${lcId}/presentations/${presentationId}/addDocuments`, {
        data: request,
        type: LCPresentationActionType.ATTACH_VAKT_DOCUMENTS_REQUEST,
        onSuccess: documents => {
          toast.success('Documents attached', { containerId: ToastContainerIds.Default })
          return {
            type: LCPresentationActionType.ATTACH_VAKT_DOCUMENTS_SUCCESS,
            payload: { documents, presentationId, lcReference }
          }
        },
        onError: LCPresentationActionType.ATTACH_VAKT_DOCUMENTS_FAILURE
      })
    )
  }
}

export const removePresentation: ActionCreator<LCPresentationActionThunkWithAnyState> = (
  lcId: string,
  presentationId: string
) => (dispatch, getState, api): Action => {
  const lcReference = getState()
    .get('lettersOfCredit')
    .get('byId')
    .toJS()[lcId].reference
  return dispatch(
    api.delete(`${TRADE_FINANCE_BASE_ENDPOINT}/lc/presentations/${presentationId}`, {
      type: LCPresentationActionType.REMOVE_PRESENTATION_REQUEST,
      onSuccess: () => removePresentationSuccess(presentationId, lcReference),
      onError: LCPresentationActionType.REMOVE_PRESENTATION_FAILURE
    })
  )
}

export const createPresentationError: ActionCreator<LCPresentationCreateError> = (error: string) => {
  toast.error(error, { containerId: ToastContainerIds.Default })
  return {
    type: LCPresentationActionType.CREATE_PRESENTATION_FAILURE,
    payload: error
  }
}

export const removePresentationSuccess: ActionCreator<LCPresentationRemoveSuccess> = (
  presentationId: string,
  lcReference: string
) => {
  toast.success('Presentation removed', { containerId: ToastContainerIds.Default })
  return {
    type: LCPresentationActionType.REMOVE_PRESENTATION_SUCCESS,
    payload: { presentationId, lcReference }
  }
}

export const deletePresentationDocument: ActionCreator<LCPresentationActionThunkWithAnyState> = (
  lcId: string,
  presentationId: string,
  documentId: string
) => (dispatch, getState, api): Action => {
  const lcReference = getState()
    .get('lettersOfCredit')
    .get('byId')
    .toJS()[lcId].reference
  return dispatch(
    api.delete(`${TRADE_FINANCE_BASE_ENDPOINT}/lc/presentations/${presentationId}/documents/${documentId}`, {
      type: LCPresentationActionType.REMOVE_PRESENTATION_DOCUMENT_REQUEST,
      onSuccess: () => {
        toast.success('Document removed', { containerId: ToastContainerIds.Default })
        return {
          type: LCPresentationActionType.REMOVE_PRESENTATION_DOCUMENT_SUCCESS,
          payload: { documentId, presentationId, lcReference }
        }
      },
      onError: LCPresentationActionType.REMOVE_PRESENTATION_DOCUMENT_FAILURE
    })
  )
}

export const createLetterOfCreditDocumentAsync: ActionCreator<LCPresentationActionThunkWithAnyState> = (
  createDocumentRequest: CreateLetterOfCreditDocumentRequest
) => {
  toast.info('Uploading document...', { containerId: ToastContainerIds.Default })
  return (dispatch: any, getState: () => ApplicationState, api: any) => {
    const extraData = {
      name: createDocumentRequest.name,
      categoryId: createDocumentRequest.categoryId,
      typeId: createDocumentRequest.documentTypeId,
      parcelId: createDocumentRequest.parcelId,
      comment: createDocumentRequest.comment
    }

    const formData = new FormData()
    formData.set('extraData', JSON.stringify(extraData))
    formData.append('fileData', createDocumentRequest.file)

    const { lcId, presentationId } = createDocumentRequest.context
    const lcReference = getState()
      .get('lettersOfCredit')
      .get('byId')
      .toJS()[lcId].reference
    return dispatch(
      api.post(`${TRADE_FINANCE_BASE_ENDPOINT}/lc/${lcId}/presentation/${presentationId}/upload`, {
        type: LCPresentationActionType.UPLOAD_PRESENTATION_DOCUMENT_REQUEST,
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        data: formData,
        onSuccess: document => uploadLCPresentationDocumentSuccess(document, presentationId, lcReference),
        onError: uploadLCPresentationDocumentError
      })
    )
  }
}

export const uploadLCPresentationDocumentSuccess = (
  document: DocumentResponse,
  presentationId: string,
  lcReference: string
) => {
  toast.success(`${document.name} added`, { containerId: ToastContainerIds.Default })
  return {
    type: LCPresentationActionType.UPLOAD_PRESENTATION_DOCUMENT_SUCCESS,
    payload: { document, presentationId, lcReference }
  }
}

export const uploadLCPresentationDocumentError = (error: string, response: any) => {
  // Handle specific errors or fallback to a generic error toast
  // HTTP 413 - Request Entity Too Large
  // This may happen when a user tries to upload a document that exceeds body size limits
  // This is enforced by api-gateway (nginx) and current limit is 200mb
  if (response && response.response && response.response.status === 413) {
    toast.error('Uploaded file has achieved the size limit', { containerId: ToastContainerIds.Default })
  }
  // Generic error toast
  else {
    toast.error(`Error uploading document: ${getEndpointError(response)}`, { containerId: ToastContainerIds.Default })
  }
  return {
    type: LCPresentationActionType.UPLOAD_PRESENTATION_DOCUMENT_FAILURE,
    error
  }
}

export const submitPresentation = (presentation: ILCPresentation, data: SubmitPresentation) => (
  dispatch,
  getState,
  api
): Action => {
  return dispatch(
    api.post(`${TRADE_FINANCE_BASE_ENDPOINT}/lc/presentations/${presentation.staticId}/submit`, {
      type: LCPresentationActionType.SUBMIT_PRESENTATION_REQUEST,
      data,
      onSuccess: () => submitPresentationSuccess(presentation),
      onError: LCPresentationActionType.SUBMIT_PRESENTATION_FAILURE
    })
  )
}

export const submitPresentationSuccess: ActionCreator<LCPresentationSubmitSuccess> = (
  presentation: ILCPresentation
) => {
  toast.success('Presentation submitted', { containerId: ToastContainerIds.Default })
  return {
    type: LCPresentationActionType.SUBMIT_PRESENTATION_SUCCESS,
    payload: presentation
  }
}

export const setPresentationDocumentsCompliant = (presentation: ILCPresentation, lcId: string) => (
  dispatch,
  getState,
  api
): Action => {
  return dispatch(
    api.post(`${TRADE_FINANCE_BASE_ENDPOINT}/lc/${lcId}/presentations/${presentation.staticId}/compliant`, {
      type: LCPresentationActionType.SET_PRESENTATION_DOCUMENTS_COMPLIANT_REQUEST,
      onSuccess: () =>
        setPresentationReviewCompleted(
          LCPresentationActionType.SET_PRESENTATION_DOCUMENTS_COMPLIANT_SUCCESS,
          presentation,
          lcId
        ),
      onError: LCPresentationActionType.SET_PRESENTATION_DOCUMENTS_COMPLIANT_FAILURE
    })
  )
}

export const setPresentationDocumentsDiscrepant = (
  presentation: ILCPresentation,
  lcId: string,
  data: DiscrepantForm
) => (dispatch, getState, api): Action => {
  return dispatch(
    api.post(`${TRADE_FINANCE_BASE_ENDPOINT}/lc/${lcId}/presentations/${presentation.staticId}/discrepant`, {
      type: LCPresentationActionType.SET_PRESENTATION_DOCUMENTS_DISCREPANT_REQUEST,
      data,
      onSuccess: () =>
        setPresentationReviewCompleted(
          LCPresentationActionType.SET_PRESENTATION_DOCUMENTS_DISCREPANT_SUCCESS,
          presentation,
          lcId
        ),
      onError: LCPresentationActionType.SET_PRESENTATION_DOCUMENTS_DISCREPANT_FAILURE
    })
  )
}

export const requestWaiverOfDiscrepancies = (presentation: ILCPresentation, lcId: string, data: DiscrepantForm) => (
  dispatch,
  getState,
  api
): Action => {
  return dispatch(
    api.post(`${TRADE_FINANCE_BASE_ENDPOINT}/lc/${lcId}/presentations/${presentation.staticId}/adviseDiscrepancies`, {
      type: LCPresentationActionType.REQ_WAIVER_OF_DISCREPANCIES_REQUEST,
      data,
      onSuccess: () =>
        setPresentationReviewCompleted(
          LCPresentationActionType.REQ_WAIVER_OF_DISCREPANCIES_SUCCESS,
          presentation,
          lcId
        ),
      onError: LCPresentationActionType.REQ_WAIVER_OF_DISCREPANCIES_FAILURE
    })
  )
}

export const setPresentationReviewCompleted = (
  actionType: LCPresentationActionType,
  presentation: ILCPresentation,
  lcId: string
) => {
  toast.success('Presentation review completed', { containerId: ToastContainerIds.Default })
  history.push(`/financial-instruments/letters-of-credit/${lcId}/presentations`)
  return {
    type: actionType,
    payload: presentation
  }
}

export const acceptRequestedDiscrepancies = (presentation: ILCPresentation, lcId: string, data: CommentForm) => (
  dispatch,
  getState,
  api
): Action => {
  return dispatch(
    api.post(`${TRADE_FINANCE_BASE_ENDPOINT}/lc/${lcId}/presentations/${presentation.staticId}/acceptDiscrepancies`, {
      type: LCPresentationActionType.ACCEPT_REQUESTED_DISCREPANCIES_REQUEST,
      data,
      onSuccess: () => {
        dispatch(setTaskInModal(null))
        return { type: LCPresentationActionType.ACCEPT_REQUESTED_DISCREPANCIES_SUCCESS }
      },
      onError: LCPresentationActionType.ACCEPT_REQUESTED_DISCREPANCIES_FAILURE
    })
  )
}

export const rejectRequestedDiscrepancies = (presentation: ILCPresentation, lcId: string, data: CommentForm) => (
  dispatch,
  getState,
  api
): Action => {
  return dispatch(
    api.post(`${TRADE_FINANCE_BASE_ENDPOINT}/lc/${lcId}/presentations/${presentation.staticId}/rejectDiscrepancies`, {
      type: LCPresentationActionType.REJECT_REQUESTED_DISCREPANCIES_REQUEST,
      data,
      onSuccess: () => {
        toast.success('Discrepancies successfully rejected', { containerId: ToastContainerIds.Default })
        dispatch(setTaskInModal(null))
        return { type: LCPresentationActionType.REJECT_REQUESTED_DISCREPANCIES_SUCCESS }
      },
      onError: LCPresentationActionType.REJECT_REQUESTED_DISCREPANCIES_FAILURE
    })
  )
}
