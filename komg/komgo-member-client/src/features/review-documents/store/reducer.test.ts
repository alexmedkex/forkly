import reducer from './reducer'
import * as immutable from 'immutable'
import {
  ReviewDocumentsState,
  ReviewDocumentsStateFields,
  ActionType,
  ReviewStatus,
  UpdateStatus,
  IFullReceivedDocumentsResponse
} from './types'
import { mockDocumentReviewResponse, mockReceivedDocuments } from './mock-data'

describe('Review reducers', () => {
  const mockIntialStateFields: ReviewDocumentsStateFields = {
    documentsReview: [mockDocumentReviewResponse],
    requestId: '',
    companyId: '',
    reviewCompleted: false
  }
  const initialState: ReviewDocumentsState = immutable.Map(mockIntialStateFields)
  const mockUpdateStatusInvalidId: UpdateStatus = {
    id: 'id1',
    productId: 'kyc',
    companyId: 'compID',
    requestId: '123',
    documents: [
      {
        documentId: 'Non existent ID',
        status: ReviewStatus.ACCEPTED,
        note: 'ACCEPTED DOCUMENT'
      }
    ]
  }
  const mockUpdateStatusValidId: UpdateStatus = {
    id: 'id1',
    productId: 'kyc',
    companyId: 'compID',
    requestId: '123',
    documents: [
      {
        documentId: 'idDoc1',
        status: ReviewStatus.ACCEPTED,
        note: 'ACCEPTED DOCUMENT'
      }
    ]
  }

  it('should default to initialState and ignore irrelevant actions', () => {
    // Arrange
    const expected = initialState
    const anonInvalidAction = { type: 'FOO', payload: ['bar'] }
    // Act
    const actual = reducer(initialState, anonInvalidAction)
    // Assert
    expect(actual).toEqual(expected)
  })

  // Test of Success reducers
  it('should set documents in response to the payload of a FETCH_DOCUMENTS_RECEIVED_SUCCESS action', () => {
    const action = {
      type: ActionType.FETCH_DOCUMENTS_RECEIVED_SUCCESS,
      payload: mockReceivedDocuments
    }

    // Act
    const expected: ReviewDocumentsStateFields = {
      documentsReview: mockReceivedDocuments.documents,
      requestId: mockReceivedDocuments.id,
      companyId: mockReceivedDocuments.companyId,
      reviewCompleted: mockReceivedDocuments.feedbackSent
    }
    const actual = reducer(initialState, action)
    // Assert
    expect(actual.get('requestId')).toEqual(expected.requestId)
    expect(actual.get('companyId')).toEqual(expected.companyId)
    expect(actual.get('reviewCompleted')).toEqual(expected.reviewCompleted)
    expect(actual.get('documentsReview')).toEqual(expected.documentsReview)
  })
  it('should set documents in response to the payload of a POST_COMPLETE_DOCUMENTS_REVIEW_SUCCESS action', () => {
    const action = {
      type: ActionType.POST_COMPLETE_DOCUMENTS_REVIEW_SUCCESS
    }

    const actual = reducer(initialState, action)
    // Assert
    expect(actual.get('reviewCompleted')).toEqual(true)
  })
  it('should NOT UPDATE document if ID not matching in PATCH_DOCUMENTS_REVIEW_SUCCESS action', () => {
    const action = {
      type: ActionType.PATCH_DOCUMENTS_REVIEW_SUCCESS,
      payload: mockUpdateStatusInvalidId
    }

    const actual = reducer(initialState, action)
    // Assert - Nothing changes as ID in the update payload doesnt match the initial document ID
    expect(actual.get('documentsReview')[0].status).toEqual(mockDocumentReviewResponse.status)
    expect(actual.get('documentsReview')[0].note).toEqual(mockDocumentReviewResponse.note)
  })
  it('should UPDATE document if ID not matching in PATCH_DOCUMENTS_REVIEW_SUCCESS action', () => {
    const action = {
      type: ActionType.PATCH_DOCUMENTS_REVIEW_SUCCESS,
      payload: mockUpdateStatusValidId
    }

    const actual = reducer(initialState, action)
    // Assert - Nothing changes as ID in the update payload doesnt match the initial document ID
    expect(actual.get('documentsReview')[0].status).toEqual(mockUpdateStatusValidId.documents[0].status)
    expect(actual.get('documentsReview')[0].note).toEqual(mockUpdateStatusValidId.documents[0].note)
  })

  // Test of Error reducers
  it('should set documents in response to the payload of a FETCH_DOCUMENTS_RECEIVED_ERROR action', () => {
    const action = {
      type: ActionType.FETCH_DOCUMENTS_RECEIVED_ERROR,
      error: Error('mocked error message FETCH_DOCUMENTS_RECEIVED_ERROR')
    }
    const actual = reducer(initialState, action)
    // Assert
    expect(actual).toEqual(initialState)
  })
  it('should set documents in response to the payload of a PATCH_DOCUMENTS_REVIEW_ERROR action', () => {
    const action = {
      type: ActionType.PATCH_DOCUMENTS_REVIEW_ERROR,
      error: Error('mocked error message PATCH_DOCUMENTS_REVIEW_ERROR')
    }
    const actual = reducer(initialState, action)
    // Assert
    expect(actual).toEqual(initialState)
  })
  it('should set documents in response to the payload of a POST_COMPLETE_DOCUMENTS_REVIEW_ERROR action', () => {
    const action = {
      type: ActionType.POST_COMPLETE_DOCUMENTS_REVIEW_ERROR,
      error: Error('mocked error message POST_COMPLETE_DOCUMENTS_REVIEW_ERROR')
    }
    const actual = reducer(initialState, action)
    // Assert
    expect(actual).toEqual(initialState)
  })
})
