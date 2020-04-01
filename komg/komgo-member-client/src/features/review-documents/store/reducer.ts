import { Reducer } from 'redux'
import * as immutable from 'immutable'

import {
  ReviewDocumentsState,
  ReviewDocumentsStateFields,
  ReviewDocumentsAction,
  ActionType,
  IFullDocumentReviewResponse,
  UpdateStatus
} from './types'

export const intialStateFields: ReviewDocumentsStateFields = {
  documentsReview: [],
  requestId: '',
  companyId: '',
  reviewCompleted: false
}

export const initialState: ReviewDocumentsState = immutable.Map(intialStateFields)

const reducer: Reducer<ReviewDocumentsState> = (
  state: ReviewDocumentsState = initialState,
  action: ReviewDocumentsAction
): ReviewDocumentsState => {
  switch (action.type) {
    case ActionType.FETCH_DOCUMENTS_RECEIVED_SUCCESS: {
      return state
        .set('documentsReview', action.payload.documents)
        .set('requestId', action.payload.id)
        .set('companyId', action.payload.companyId)
        .set('reviewCompleted', action.payload.feedbackSent)
    }
    case ActionType.FETCH_DOCUMENTS_RECEIVED_ERROR: {
      return state
    }
    case ActionType.POST_COMPLETE_DOCUMENTS_REVIEW_ERROR: {
      return state
    }
    case ActionType.POST_COMPLETE_DOCUMENTS_REVIEW_SUCCESS: {
      return state.set('reviewCompleted', true)
    }
    case ActionType.PATCH_DOCUMENTS_REVIEW_ERROR: {
      return state
    }
    case ActionType.PATCH_DOCUMENTS_REVIEW_SUCCESS: {
      const update: UpdateStatus = action.payload
      /* It updates the documents on the state which ID matches with the ID of
      the documents sent in the payload */
      const newReviewedDocuments: IFullDocumentReviewResponse[] = state.get('documentsReview').map(doc => {
        const updatedDoc = update.documents.find(x => x.documentId === doc.document.id)
        if (updatedDoc) {
          doc.note = updatedDoc.note
          doc.status = updatedDoc.status
        }
        return doc
      })
      return state.set('documentsReview', newReviewedDocuments)
    }
    case ActionType.FETCH_SUBMITTED_DOCUMENTS_SUCCESS: {
      return state.set('documentsReview', action.payload.documents).set('companyId', action.payload.companyId)
    }
    default:
      return state
  }
}

export default reducer
