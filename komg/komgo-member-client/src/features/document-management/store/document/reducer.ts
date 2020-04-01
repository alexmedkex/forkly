import * as immutable from 'immutable'
import { Reducer } from 'redux'

import { DocumentActionType, DocumentState, DocumentStateFields, DocumentAction } from '../types'

export const intialStateFields: DocumentStateFields = {
  loadedDocument: undefined,
  error: null,
  isLoading: false,
  isLoadingContent: false,
  documentRaw: '',
  documentType: ''
}

export const initialState: DocumentState = immutable.Map(intialStateFields)

const reducer: Reducer<DocumentState> = (state = initialState, action: DocumentAction): DocumentState => {
  switch (action.type) {
    case DocumentActionType.START_FETCHING_DOCUMENT_CONTENT: {
      return state.set('isLoadingContent', true)
    }
    case DocumentActionType.FETCH_DOCUMENT_SUCCESS: {
      return state.set('loadedDocument', action.payload).set('isLoading', false)
    }
    case DocumentActionType.FETCH_DOCUMENT_ERROR: {
      return state.set('error', action.error).set('isLoading', false)
    }
    case DocumentActionType.FETCH_DOCUMENT_CONTENT_SUCCESS: {
      return state
        .set('documentRaw', action.payload.toString('base64'))
        .set('documentType', action.contentType)
        .set('isLoadingContent', false)
    }
    case DocumentActionType.FETCH_DOCUMENT_CONTENT_ERROR: {
      return state.set('error', action.error)
    }
    case DocumentActionType.RESET_LOADED_DOCUMENT: {
      return state.set('loadedDocument', undefined).set('documentRaw', '')
    }
    default:
      return state
  }
}

export default reducer
