import * as immutable from 'immutable'
import { Reducer } from 'redux'

import { RequestAction, RequestActionType, RequestState, RequestStateFields, Request } from '../types'

export const intialStateFields: RequestStateFields = {
  outgoingRequests: [],
  requests: [],
  requestById: null,
  sentDocumentRequestTypes: new Map(),
  error: null
}

export const initialState: RequestState = immutable.Map(intialStateFields)

const reducer: Reducer<RequestState> = (state = initialState, action: RequestAction): RequestState => {
  switch (action.type) {
    case RequestActionType.FETCH_REQUEST_SUCCESS: {
      return state
        .set('outgoingRequests', action.payload)
        .set('sentDocumentRequestTypes', createSentDocumentRequestTypes(action.payload))
    }
    case RequestActionType.FETCH_REQUEST_BY_ID_SUCCESS: {
      const outgoingRequests = state.get('outgoingRequests').filter(request => request.id !== action.payload.id)
      return state.set('outgoingRequests', [...outgoingRequests, action.payload])
    }
    case RequestActionType.FETCH_REQUEST_ERROR: {
      return state.set('error', action.error)
    }
    case RequestActionType.CREATE_REQUEST_SUCCESS: {
      const requests = state.get('requests')
      return state.set('requests', [...requests, action.payload])
    }
    case RequestActionType.CREATE_REQUEST_ERROR: {
      return state.set('error', action.error)
    }
    case RequestActionType.FETCH_INCOMING_REQ_SUCCESS: {
      return state.set('requests', action.payload)
    }
    case RequestActionType.FETCH_INCOMING_REQUEST_BY_ID_SUCCESS: {
      return state.set('requestById', action.payload)
    }
    case RequestActionType.FETCH_INCOMING_REQ_FAILURE: {
      return state.set('error', action.error)
    }
    default:
      return state
  }
}

// construct a map with companyId -> [send_document_request_type1, ...]
// e.g.:
//  - 08e9f8e3-94e5-459e-8458-ab512bee6e2c: ["Passports of the directors"]
//  - cf63c1f8-1165-4c94-a8f8-9252eb4f0016: ["Article of association", "Proof of registration"]
//  - ...
function createSentDocumentRequestTypes(payload: Request[]): Map<string, Set<string>> {
  const sentDocumentRequestTypes: Map<string, Set<string>> = new Map()
  if (!payload) {
    return sentDocumentRequestTypes
  }

  payload.forEach(docRequest => {
    // edge cases - skip if companyId is missing
    if (!docRequest || !docRequest.companyId) {
      return
    }
    let uniqueTypes: Set<string> | undefined = sentDocumentRequestTypes.get(docRequest.companyId)
    // ensure uniqueTypes is initialized and is added to the Map
    if (!uniqueTypes) {
      uniqueTypes = new Set()
      sentDocumentRequestTypes.set(docRequest.companyId, uniqueTypes)
    }

    // add all found types in current document request to the uniqueType types
    // given we're using a Set, we can add repeated values as it guarantees element uniqueness
    // edge case - do nothing if types doesn't exist
    if (docRequest.types) {
      docRequest.types.forEach(type => uniqueTypes!.add(type.name))
    }
  })

  return sentDocumentRequestTypes
}

export default reducer
