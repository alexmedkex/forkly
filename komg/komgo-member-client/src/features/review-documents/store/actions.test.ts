import { makeTestStore } from '../../../utils/test-helpers'
import { ApiActionType, ApiAction, Method } from '../../../utils/http'
import {
  fetchDocumentsReceivedSuccess,
  fetchDocumentsReceivedError,
  fetchDocumentsReceivedAsync,
  postCompleteDocumentReviewSuccess,
  postCompleteDocumentReviewError,
  postCompleteDocumentReviewAsync,
  patchDocumentsReviewSuccess,
  patchDocumentsReviewError,
  patchDocumentsReviewAsync,
  fetchLCPresentationSubmittedDocWithDocContent
} from './actions'
import { ActionType } from './types'
import { mockReceivedDocuments } from './mock-data'
import { TRADE_FINANCE_BASE_ENDPOINT } from '../../../utils/endpoints'

// Fetch DocumentsReceived
describe('fetch Documents Received', () => {
  const fetchDocumentsReceivedEndpoint = '/received-documents/'
  it('fetchDocumentsReceivedAsync()', () => {
    // Arrange
    const store = makeTestStore()

    const expected: ApiAction = {
      type: ApiActionType.API_REQUEST,
      meta: {
        method: Method.GET,
        url: fetchDocumentsReceivedEndpoint,
        onSuccess: fetchDocumentsReceivedSuccess,
        onError: fetchDocumentsReceivedError
      },
      payload: ''
    }
    // Assert
    const actual = store.dispatch<any>(fetchDocumentsReceivedAsync(mockReceivedDocuments.id))
    expect(actual.meta.method).toEqual(expected.meta!.method)
    expect(actual.meta.onError).toEqual(expected.meta!.onError)
    expect(actual.meta.onSuccess).toEqual(expected.meta!.onSuccess)
  })
  it(`fetchDocumentsReceivedSuccess()`, () => {
    const actionFunc = fetchDocumentsReceivedSuccess
    const actionExpected = {
      type: ActionType.FETCH_DOCUMENTS_RECEIVED_SUCCESS,
      payload: mockReceivedDocuments
    }
    // Act
    const actual = actionFunc(mockReceivedDocuments)
    expect(actual).toMatchObject(actionExpected)
  })
  it(`fetchDocumentsReceivedError()`, () => {
    const actionFunc = fetchDocumentsReceivedError
    const expectedError = new Error('OH DEAR!')
    const actionExpected = {
      type: ActionType.FETCH_DOCUMENTS_RECEIVED_ERROR,
      error: expectedError
    }
    // Act
    const actual = actionFunc(expectedError)
    expect(actual).toMatchObject(actionExpected)
  })
})

// Post send-feed back
describe('post send-feedback on received documents', () => {
  const postDocumentsReceivedEndpoint = `/received-documents/${mockReceivedDocuments.id}/send-feedback`
  it('postDocumentsReceivedEndpoint()', () => {
    // Arrange
    const store = makeTestStore()

    const expected: ApiAction = {
      type: ApiActionType.API_REQUEST,
      meta: {
        method: Method.POST,
        url: postDocumentsReceivedEndpoint,
        onSuccess: postCompleteDocumentReviewSuccess,
        onError: postCompleteDocumentReviewError
      },
      payload: ''
    }
    // Assert
    const actual = store.dispatch<any>(postCompleteDocumentReviewAsync(mockReceivedDocuments.id))
    expect(actual.meta.method).toEqual(expected.meta!.method)
    expect(actual.meta.onError).toEqual(expected.meta!.onError)
    expect(actual.meta.onSuccess).toEqual(expected.meta!.onSuccess)
  })
  it(`postDocumentsReceivedEndpointSuccess()`, () => {
    const actionFunc = postCompleteDocumentReviewSuccess
    const actionExpected = {
      type: ActionType.POST_COMPLETE_DOCUMENTS_REVIEW_SUCCESS
    }
    // Act
    const actual = actionFunc()
    expect(actual).toMatchObject(actionExpected)
  })
  it(`postDocumentsReceivedEndpointError()`, () => {
    const actionFunc = postCompleteDocumentReviewError
    const expectedError = new Error('OH DEAR!')
    const actionExpected = {
      type: ActionType.POST_COMPLETE_DOCUMENTS_REVIEW_ERROR,
      error: expectedError
    }
    // Act
    const actual = actionFunc(expectedError)
    expect(actual).toMatchObject(actionExpected)
  })
})

// Update document review status
describe('Update status on received documents', () => {
  const patchDocumentsReceivedEndpoint = `/received-documents/${mockReceivedDocuments.id}/documents`
  it('patchDocumentsReceivedEndpoint()', () => {
    // Arrange
    const store = makeTestStore()

    const expected: ApiAction = {
      type: ApiActionType.API_REQUEST,
      meta: {
        method: Method.PATCH,
        url: patchDocumentsReceivedEndpoint,
        onSuccess: patchDocumentsReviewSuccess,
        onError: patchDocumentsReviewError
      },
      payload: ''
    }
    // Assert
    const actual = store.dispatch<any>(patchDocumentsReviewAsync(mockReceivedDocuments.id, []))
    expect(actual.meta.method).toEqual(expected.meta!.method)
    expect(actual.meta.onError).toEqual(expected.meta!.onError)
    expect(actual.meta.onSuccess).toEqual(expected.meta!.onSuccess)
  })
  it(`patchDocumentsReviewSuccess()`, () => {
    const actionFunc = patchDocumentsReviewSuccess
    const actionExpected = {
      type: ActionType.PATCH_DOCUMENTS_REVIEW_SUCCESS
    }
    // Act
    const actual = actionFunc()
    expect(actual).toMatchObject(actionExpected)
  })
  it(`patchDocumentsReviewError()`, () => {
    const actionFunc = patchDocumentsReviewError
    const expectedError = new Error('OH DEAR!')
    const actionExpected = {
      type: ActionType.PATCH_DOCUMENTS_REVIEW_ERROR,
      error: expectedError
    }
    // Act
    const actual = actionFunc(expectedError)
    expect(actual).toMatchObject(actionExpected)
  })
})

describe('fetchLCPresentationSubmittedDocWithDocContent()', () => {
  let dispatchMock: any
  let apiMock: any
  let getStateMock: any
  const dummyAction = { type: 'test' }

  beforeEach(() => {
    dispatchMock = jest.fn()
    getStateMock = jest.fn()
    apiMock = {
      post: jest.fn(() => dummyAction),
      get: jest.fn(() => dummyAction),
      delete: jest.fn(() => dummyAction)
    }
  })

  it('should return appropriate object when we call action', () => {
    fetchLCPresentationSubmittedDocWithDocContent('lc123', 'p123', undefined)(dispatchMock, getStateMock, apiMock)

    const [endpoint, config] = apiMock.get.mock.calls[0]

    expect(endpoint).toBe(`${TRADE_FINANCE_BASE_ENDPOINT}/lc/lc123/presentations/p123/documents-feedback`)

    expect(config.onError).toBe(ActionType.FETCH_SUBMITTED_DOCUMENTS_FAILURE)
    expect(config.onSuccess('Test')).toEqual({
      payload: 'Test',
      type: ActionType.FETCH_SUBMITTED_DOCUMENTS_SUCCESS
    })
  })
})
