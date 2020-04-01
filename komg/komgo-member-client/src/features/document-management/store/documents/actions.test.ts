import createMockInstance from 'jest-create-mock-instance'
import {
  fetchDocumentsAsync,
  fetchDocumentsError,
  fetchDocumentsSuccess,
  searchDocumentsAsync,
  searchDocumentsError,
  searchDocumentsSuccess,
  sendDocumentsAsync,
  shareDocumentError,
  shareDocumentSuccess,
  setCounterpartyFilter,
  setDocumentListFilter,
  setCounterpartyDocsFilter,
  downloadTradeFinanceDocument,
  fetchTradeFinanceDocuments,
  getTradeFinanceDocumentByHash
} from './actions'
import { Category, Document, DocumentActionType, DocumentType, Product, DocumentTypeActionType } from '../types'
import { makeTestStore } from '../../../../utils/test-helpers'
import { ApiActionType, ApiAction, Method } from '../../../../utils/http'
import { ShareRepliesCounter } from './actions'
import { BottomSheetStatus, BottomSheetActionType } from '../../../bottom-sheet/store/types'
import { v4 } from 'uuid'
import { DOCUMENTS_BASE_ENDPOINT } from '../../../../utils/endpoints'
import { ApplicationState } from '../../../../store/reducers'
import { fromJS } from 'immutable'

// Arrange
const documentEndpoint = '/products/kyc'

const mockProduct: Product = { name: 'KYC', id: 'kyc' }

const mockDate = new Date('31-12-2000')

const mockCategory: Category = {
  id: 'company-details',
  name: 'company-details',
  product: mockProduct
}

const mockDocumentType: DocumentType = {
  product: { name: 'KYC', id: 'kyc' },
  category: { name: 'business-description', id: 'business-description', product: { name: 'KYC', id: 'kyc' } },
  name: 'Identity Documents',
  id: '1',
  fields: [],
  predefined: false
}

const mockDocument: Document = {
  name: 'Document1',
  id: '123456',
  documentId: 'document-id',
  product: mockProduct,
  category: mockCategory,
  type: mockDocumentType,
  owner: { firstName: 'Owner', lastName: 'OwnerL', companyId: 'company-id' },
  hash: 'string',
  receivedDate: mockDate,
  registrationDate: mockDate,
  metadata: [],
  content: undefined,
  sharedWith: [],
  sharedBy: '',
  state: BottomSheetStatus.REGISTERED
}

const mockDocumentSharedWith: Document = {
  name: 'Document1',
  id: '123456',
  documentId: 'document-id',
  product: mockProduct,
  category: mockCategory,
  type: mockDocumentType,
  owner: { firstName: 'Owner', lastName: 'OwnerL', companyId: 'company-id' },
  hash: 'string',
  receivedDate: mockDate,
  registrationDate: mockDate,
  metadata: [],
  content: undefined,
  sharedWith: [{ counterpartyId: '1', sharedDates: [new Date()] }],
  sharedBy: '',
  state: BottomSheetStatus.REGISTERED
}

const mockShareRepliesCounter = createMockInstance(ShareRepliesCounter)

describe('fetch Documents Actions', () => {
  it(`fetchDocumentsSuccess()`, () => {
    // Arrange
    const actionExpected = {
      type: DocumentActionType.FETCH_DOCUMENTS_SUCCESS,
      payload: mockDocument
    }
    // Act
    const actual = fetchDocumentsSuccess(mockDocument)
    expect(actual).toMatchObject(actionExpected)
  })

  it(`fetchDocumentsError()`, () => {
    const expectedError = new Error('OH DEAR!')
    const actionExpected = {
      type: DocumentActionType.FETCH_DOCUMENTS_ERROR,
      error: expectedError
    }
    // Act
    const actual = fetchDocumentsError(expectedError)
    expect(actual).toMatchObject(actionExpected)
  })

  it(`searchDocumentsSuccess()`, () => {
    // Arrange
    const actionExpected = {
      type: DocumentActionType.SEARCH_DOCUMENTS_SUCCESS,
      payload: mockDocument
    }
    // Act
    const actual = searchDocumentsSuccess(mockDocument)
    expect(actual).toMatchObject(actionExpected)
  })

  it(`searchDocumentsError()`, () => {
    const expectedError = new Error('OH DEAR!')
    const actionExpected = {
      type: DocumentActionType.SEARCH_DOCUMENTS_ERROR,
      error: expectedError
    }
    // Act
    const actual = searchDocumentsError(expectedError)
    expect(actual).toMatchObject(actionExpected)
  })

  it(`should dispatch an API_REQUEST to the Document fetch endpoint`, async () => {
    // Arrange
    const store = makeTestStore()

    const expected: ApiAction = {
      type: ApiActionType.API_REQUEST,
      meta: {
        method: Method.GET,
        url: documentEndpoint,
        onSuccess: fetchDocumentsSuccess,
        onError: fetchDocumentsError
      },
      payload: ''
    }

    // Assert
    const actual = await store.dispatch<any>(fetchDocumentsAsync())
    expect(actual.meta.method).toEqual(expected.meta!.method)
    expect(actual.meta.onError).toEqual(expected.meta!.onError)
    expect(actual.meta.onSuccess).toEqual(expected.meta!.onSuccess)
  })

  it(`should dispatch an API_REQUEST to the Document fetch endpoint`, async () => {
    // Arrange
    const store = makeTestStore()

    const expected: ApiAction = {
      type: ApiActionType.API_REQUEST,
      meta: {
        method: Method.GET,
        url: documentEndpoint,
        onSuccess: searchDocumentsSuccess,
        onError: searchDocumentsError
      },
      payload: ''
    }

    // Assert
    const actual = await store.dispatch<any>(searchDocumentsAsync())
    expect(actual.meta.method).toEqual(expected.meta!.method)
    expect(actual.meta.onError).toEqual(expected.meta!.onError)
    expect(actual.meta.onSuccess).toEqual(expected.meta!.onSuccess)
  })
  describe('downloadTradeFinanceDocument', () => {
    let dispatchMock: any
    let apiMock: any
    let getStateMock: any
    const dummyAction = { type: 'test' }

    beforeEach(() => {
      dispatchMock = jest.fn()
      apiMock = {
        post: jest.fn(() => dummyAction),
        get: jest.fn(() => dummyAction)
      }
      getStateMock = jest.fn()
    })

    it('calls get with correct arguments', () => {
      const id = v4()

      downloadTradeFinanceDocument(id)(dispatchMock, getStateMock, apiMock)

      const [endpoint, config] = apiMock.get.mock.calls[0]

      expect(endpoint).toEqual(`${DOCUMENTS_BASE_ENDPOINT}/trade-finance/documents/${id}/content?printVersion=${true}`)

      expect(config.onError()).toEqual(
        expect.objectContaining({ type: DocumentActionType.FETCH_DOCUMENT_CONTENT_ERROR })
      )
      expect(config.onSuccess('aaa', { 'content-type': 'aaa' })).toEqual(
        expect.objectContaining({ type: DocumentActionType.FETCH_DOCUMENT_CONTENT_SUCCESS })
      )
      expect(config.type).toEqual(DocumentActionType.FETCH_DOCUMENT_CONTENT_REQUEST)
    })
  })
  describe('fetchTradeFinanceDocuments', () => {
    let dispatchMock: any
    let apiMock: any
    let getStateMock: any
    const dummyAction = { type: 'test' }

    beforeEach(() => {
      dispatchMock = jest.fn()
      apiMock = {
        post: jest.fn(() => dummyAction),
        get: jest.fn(() => dummyAction)
      }
      getStateMock = jest.fn()
    })

    it('calls get with correct arguments', () => {
      fetchTradeFinanceDocuments()(dispatchMock, getStateMock, apiMock)

      const [endpoint, config] = apiMock.get.mock.calls[0]

      expect(endpoint).toEqual(`${DOCUMENTS_BASE_ENDPOINT}/trade-finance/documents`)

      expect(config.onError()).toEqual(expect.objectContaining({ type: DocumentActionType.FETCH_DOCUMENTS_ERROR }))
      expect(config.onSuccess).toEqual(expect.objectContaining({ type: DocumentActionType.FETCH_DOCUMENTS_SUCCESS }))
      expect(config.type).toEqual(DocumentActionType.FETCH_DOCUMENTS_REQUEST)
    })
    it('calls afterHandler on success', () => {
      const afterHandler = jest.fn(() => () => ({}))

      fetchTradeFinanceDocuments(afterHandler)(dispatchMock, getStateMock, apiMock)

      const [, config] = apiMock.get.mock.calls[0]

      config.onSuccess.afterHandler({ dispatch: dispatchMock, getState: getStateMock })

      expect(afterHandler).toHaveBeenCalled()
    })
  })
  describe('getTradeFinanceDocumentByHash', () => {
    let dispatchMock: any
    let apiMock: any
    let getStateMock: any
    const dummyAction = { type: 'test' }

    beforeEach(() => {
      dispatchMock = jest.fn()
      apiMock = {
        post: jest.fn(() => dummyAction),
        get: jest.fn(() => dummyAction)
      }
      getStateMock = jest.fn()
    })

    it('calls get all trade finance docs', () => {
      const hash = v4()

      getTradeFinanceDocumentByHash(hash)(dispatchMock, getStateMock, apiMock)

      const [endpoint, config] = apiMock.get.mock.calls[0]

      expect(endpoint).toEqual(`${DOCUMENTS_BASE_ENDPOINT}/trade-finance/documents`)

      expect(config.onError()).toEqual(expect.objectContaining({ type: DocumentActionType.FETCH_DOCUMENTS_ERROR }))
      expect(config.onSuccess).toEqual(expect.objectContaining({ type: DocumentActionType.FETCH_DOCUMENTS_SUCCESS }))
      expect(config.type).toEqual(DocumentActionType.FETCH_DOCUMENTS_REQUEST)
    })

    it('calls get document content when store has a match of the hash', () => {
      const hash = v4()

      getTradeFinanceDocumentByHash(hash)(dispatchMock, getStateMock, apiMock)

      const [, firstConfig] = apiMock.get.mock.calls[0]

      const documentId = v4()
      let state: ApplicationState = fromJS({
        documents: {
          allDocuments: []
        }
      })

      // We can't use fromJS directly because in the app we aren't using immutable fully for this reducer
      state = state.set('documents', state.get('documents').set('allDocuments', [{ id: documentId, hash } as any]))

      getStateMock = jest.fn().mockImplementation(() => state)

      firstConfig.onSuccess.afterHandler({ dispatch: dispatchMock, getState: getStateMock })

      expect(apiMock.get).toHaveBeenCalledTimes(2)

      const [endpoint, secondConfig] = apiMock.get.mock.calls[1]

      expect(endpoint).toEqual(`/docs/v0/trade-finance/documents/${documentId}/content?printVersion=${true}`)
      expect(secondConfig.type).toEqual(DocumentActionType.FETCH_DOCUMENT_CONTENT_REQUEST)
    })
    it('does not call get document content when store has no match for hash', () => {
      const hash = v4()

      getTradeFinanceDocumentByHash(hash)(dispatchMock, getStateMock, apiMock)

      const [, firstConfig] = apiMock.get.mock.calls[0]

      const state: ApplicationState = fromJS({
        documents: {
          allDocuments: []
        }
      })

      getStateMock = jest.fn().mockImplementation(() => state)

      firstConfig.onSuccess.afterHandler({ dispatch: dispatchMock, getState: getStateMock })

      expect(apiMock.get).toHaveBeenCalledTimes(1)
    })
  })
})

describe('fetch Documents by id Actions', () => {
  it(`shareDocumentSuccess()`, () => {
    const mockDispatch = jest.fn()
    const actionFunc = shareDocumentSuccess
    const actionExpected = {
      type: DocumentActionType.SEND_DOCUMENTS_SUCCESS,
      payload: [mockDocumentSharedWith]
    }
    // Act
    const actual = actionFunc(mockDispatch, mockShareRepliesCounter)([mockDocumentSharedWith])
    expect(actual).toMatchObject(actionExpected)
  })
  it(`shareDocumentError()`, () => {
    const mockDispatch = jest.fn()
    const actionFunc = shareDocumentError
    const expectedError = new Error('OH DEAR!')
    const actionExpected = {
      type: DocumentActionType.SEND_DOCUMENTS_ERROR,
      error: expectedError
    }

    // Act
    const actual = actionFunc(mockDispatch, mockShareRepliesCounter)(expectedError, null)
    expect(actual).toMatchObject(actionExpected)
  })
  it(`should dispatch an API_REQUEST to the share Document endpoint`, async () => {
    // Arrange
    const store = makeTestStore()

    const expected: ApiAction = {
      type: ApiActionType.API_REQUEST,
      meta: {
        method: Method.POST,
        url: documentEndpoint,
        onSuccess: shareDocumentSuccess(store.dispatch, mockShareRepliesCounter),
        onError: shareDocumentError(store.dispatch, mockShareRepliesCounter)
      },
      payload: ''
    }
    // Assert
    const actual = await store.dispatch<any>(
      sendDocumentsAsync([
        {
          documents: [mockDocument],
          companyId: '1'
        }
      ])
    )
    expect(actual.meta.method).toEqual(expected.meta!.method)
    expect(actual.meta.method).toEqual(Method.POST)
  })
})

describe('Documents with verification link', () => {
  it('setCounterpartyFilter()', () => {
    const actionExpected = {
      type: DocumentActionType.SET_COUNTERPARTY_FILTER,
      payload: { renewalDateKey: 'all' }
    }
    // Act
    const actual = setCounterpartyFilter({ renewalDateKey: 'all' })
    expect(actual).toMatchObject(actionExpected)
  })
})

describe('Filter actions', () => {
  describe('setDocumentListFilter', () => {
    it('should return appropriate object when filter is empty object', () => {
      expect(setDocumentListFilter({})).toEqual({
        type: DocumentActionType.SET_DOCUMENT_LIST_FILTER,
        payload: {}
      })
    })

    it('should return appropriate object when filter is passed', () => {
      expect(setDocumentListFilter({ type: ['123'] })).toEqual({
        type: DocumentActionType.SET_DOCUMENT_LIST_FILTER,
        payload: { type: ['123'] }
      })
    })

    it('should return appropriate object when filter is null', () => {
      expect(setDocumentListFilter(null)).toEqual({
        type: DocumentActionType.SET_DOCUMENT_LIST_FILTER,
        payload: null
      })
    })
  })

  describe('setCounterpartyDocsFilter', () => {
    it('should return appropriate object when filter and counterparty are sent', () => {
      expect(setCounterpartyDocsFilter({ type: ['123'] }, '123')).toEqual({
        type: DocumentActionType.SET_COUNTERPARTY_DOCS_FILTER,
        payload: { filter: { type: ['123'] }, counterpartyId: '123' }
      })
    })
    it('should return appropriate object when filter is null', () => {
      expect(setCounterpartyDocsFilter(null)).toEqual({
        type: DocumentActionType.SET_COUNTERPARTY_DOCS_FILTER,
        payload: null
      })
    })
  })
})
