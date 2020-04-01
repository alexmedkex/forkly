import * as immutable from 'immutable'
import { Reducer } from 'redux'

import {
  DocumentTypeAction,
  DocumentTypeActionType,
  DocumentTypeState,
  DocumentTypeStateFields,
  DocumentType
} from '../types'

export const intialStateFields: DocumentTypeStateFields = {
  documentTypes: [],
  isLoadingDocumentTypes: false,
  error: null
}

export const initialState: DocumentTypeState = immutable.Map(intialStateFields)

const reducer: Reducer<DocumentTypeState> = (state = initialState, action: DocumentTypeAction): DocumentTypeState => {
  switch (action.type) {
    case DocumentTypeActionType.START_FETCHING_DOCUMENT_TYPES:
      return state.set('isLoadingDocumentTypes', true)
    case DocumentTypeActionType.FETCH_DOCUMENT_TYPES_SUCCESS: {
      const documents = state.get('documentTypes')
      return state.set('documentTypes', action.payload).set('isLoadingDocumentTypes', false)
    }
    case DocumentTypeActionType.FETCH_DOCUMENT_TYPES_ERROR: {
      return state.set('error', action.error).set('isLoadingDocumentTypes', false)
    }
    case DocumentTypeActionType.CREATE_DOCUMENT_TYPE_SUCCESS: {
      const documents = state.get('documentTypes')
      return state.set('documentTypes', [...documents, action.payload])
    }
    case DocumentTypeActionType.CREATE_DOCUMENT_TYPE_ERROR: {
      return state.set('error', action.error)
    }
    case DocumentTypeActionType.UPDATE_DOCUMENT_TYPE_SUCCESS: {
      const documentTypes = state.get('documentTypes')
      return state.set(
        'documentTypes',
        documentTypes.map((documentType: DocumentType) => {
          return documentType.id === action.payload.id ? { ...documentType, ...action.payload } : documentType
        })
      )
    }
    case DocumentTypeActionType.UPDATE_DOCUMENT_TYPE_ERROR: {
      return state.set('error', action.error)
    }
    case DocumentTypeActionType.DELETE_DOCUMENT_TYPE_SUCCESS: {
      return state // TODO: /products/kyc/types/ does not return id of deleted docType. Necessary to update state.
    }
    case DocumentTypeActionType.DELETE_DOCUMENT_TYPE_ERROR: {
      return state.set('error', action.error)
    }
    default:
      return state
  }
}

export default reducer
