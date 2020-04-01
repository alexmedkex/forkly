import * as immutable from 'immutable'

import {
  Category,
  Document,
  DocumentActionType,
  DocumentsState,
  DocumentsStateFields,
  DocumentType,
  FetchDocumentsError,
  Product,
  SearchDocumentsError,
  SearchDocumentsStart,
  SelectDocument,
  SelectDocumentType,
  SendDocumentsSuccess
} from '../types'
import reducer from './reducer'
import { visibleDocuments } from '../../utils/selectors'
import { BottomSheetStatus } from '../../../bottom-sheet/store/types'

describe('Document reducers', () => {
  const mockProduct: Product = { name: 'KYC', id: 'kyc' }
  const mockCategory: Category = { id: 'banking-documents', name: 'banking-documents', product: mockProduct }
  const mockType: DocumentType = {
    id: '2',
    name: 'type-name',
    product: mockProduct,
    category: mockCategory,
    fields: [],
    predefined: true
  }

  const COMPANY_ID = 'societegenerale'
  const mockedDate = new Date('31-12-2000')
  const sharedDates = { counterpartyId: COMPANY_ID, sharedDates: [mockedDate] }

  const mockDocument: Document = {
    id: '1',
    documentId: 'document-id',
    name: 'AML Letter - test',
    product: mockProduct,
    category: mockCategory,
    type: mockType,
    owner: { firstName: 'Owner', lastName: 'Owner', companyId: 'company-id' },
    hash: 'hash',
    receivedDate: mockedDate,
    registrationDate: mockedDate,
    metadata: [],
    content: undefined,
    sharedWith: [sharedDates],
    sharedBy: '',
    state: BottomSheetStatus.REGISTERED
  }

  const EXT_SHARED_DOC_ID = 'ext-shared-doc-id-1'

  const mockStateFields: DocumentsStateFields = {
    allDocuments: [],
    documentsById: immutable.Map(),
    documentsSet: immutable.Set(),
    documentsSearchResult: [],
    isLoading: false,
    error: null,
    selectedDocuments: [],
    selectedDocumentTypes: [],
    isLoadingDocuments: false,
    filters: {
      selectedCategoryId: 'all',
      selectedCounterparty: '',
      search: '',
      parcel: 'all',
      shared: 'all'
    },
    documentListFilter: null,
    counterpartyDocsFilter: null,
    counterpartyFilter: null
  }
  let initialState: DocumentsState

  beforeEach(() => {
    initialState = immutable.Map(mockStateFields)
  })

  it('should default to initialState and ignore irrelevant actions', () => {
    // Arrange
    const expected = initialState
    const anonInvalidAction = { type: 'FOO', payload: ['bar'] }
    // Act
    const actual = reducer(initialState, anonInvalidAction)
    // Assert
    expect(actual).toEqual(expected)
  })

  it('should set documents in response to the payload of a FETCH_DOCUMENTS_SUCCESS action', () => {
    const mockPayload: Document = { ...mockDocument, ...{ id: '321' } }
    const action = {
      type: DocumentActionType.FETCH_DOCUMENTS_SUCCESS,
      payload: [mockPayload]
    }

    // Act
    const expected = initialState.get('allDocuments').concat(action.payload)
    const actual = reducer(initialState, action)
    // Assert
    expect(actual.get('allDocuments')).toEqual(expected)
    expect(actual.get('documentsById').toJS()[mockPayload.id]).toMatchObject(action.payload[0])
  })

  it('should delete a document from documentsById for DELETE_DOCUMENT_SUCCESS action', () => {
    const mockPayload: Document = { ...mockDocument, ...{ id: '321' } }
    const action = {
      type: DocumentActionType.DELETE_DOCUMENT_SUCCESS,
      payload: mockPayload
    }
    const documentsById = immutable.Map<string, Document>().set(mockPayload.id, mockPayload)
    const currentState = initialState.set('documentsById', documentsById)
    // Act
    const actual = reducer(currentState, action)
    // Assert
    expect(actual.get('documentsById').toJS()[mockPayload.id]).toBeUndefined()
  })

  it('should create a document and add it to documentsById for CREATE_DOCUMENT_SUCCESS action', () => {
    const mockPayload: Document = { ...mockDocument, ...{ id: '321' } }
    const action = {
      type: DocumentActionType.CREATE_DOCUMENT_SUCCESS,
      payload: mockPayload
    }
    // Act
    const actual = reducer(initialState, action)
    // Assert
    expect(actual.get('documentsById').toJS()[mockPayload.id]).toMatchObject(mockPayload)
  })

  it('should update a document state to regsitered documentsById for SHOW_DOCUMENT_REGISTERED_SUCCESS action', () => {
    const mockPayload: Document = { ...mockDocument, ...{ id: '321' } }
    const action = {
      type: DocumentActionType.SHOW_DOCUMENT_REGISTERED_SUCCESS,
      payload: mockPayload
    }
    const documentsById = immutable.Map<string, Document>().set(mockPayload.id, mockPayload)
    const currentState = initialState.set('documentsById', documentsById)
    // Act
    const actual = reducer(currentState, action)
    // Assert
    expect(actual.get('documentsById').toJS()[mockPayload.id].state).toBe(BottomSheetStatus.REGISTERED)
  })

  it('should set an error in case FETCH_DOCUMENTS_ERROR action', () => {
    const expectedError = new Error('could not fetch the documents')
    const action: FetchDocumentsError = {
      type: DocumentActionType.FETCH_DOCUMENTS_ERROR,
      error: expectedError
    }

    const actual = reducer(initialState, action)
    expect(actual.get('error')).toEqual(expectedError)
  })

  it('should set an error in case SEARCH_DOCUMENTS_ERROR action', () => {
    const action: SearchDocumentsStart = {
      type: DocumentActionType.SEARCH_DOCUMENTS_START
    }

    // Act
    const actual = reducer(initialState, action)

    // Assert
    expect(actual.get('isLoading')).toEqual(true)
  })

  it('should set found documents in response to the payload of a SEARCH_DOCUMENTS_SUCCESS action', () => {
    const mockPayload: Document = { ...mockDocument, ...{ id: '321' } }
    const action = {
      type: DocumentActionType.SEARCH_DOCUMENTS_SUCCESS,
      payload: [mockPayload]
    }

    // Act
    const expected = initialState.get('documentsSearchResult').concat(action.payload)
    const actual = reducer(initialState, action)

    // Assert
    expect(actual.get('documentsSearchResult')).toEqual(expected)
    expect(actual.get('isLoading')).toEqual(false)
  })

  it('should set an error in case SEARCH_DOCUMENTS_ERROR action', () => {
    const expectedError = new Error('could not fetch the documents')
    const action: SearchDocumentsError = {
      type: DocumentActionType.SEARCH_DOCUMENTS_ERROR,
      error: expectedError
    }

    // Act
    const actual = reducer(initialState, action)

    // Assert
    expect(actual.get('error')).toEqual(expectedError)
    expect(actual.get('isLoading')).toEqual(false)
  })

  it('should set selectedDocuments in response to SELECT_DOCUMENT action', () => {
    const mockSelectedDocumentIds: string[] = [mockDocument.id]
    const action: SelectDocument = { type: DocumentActionType.SELECT_DOCUMENT, payload: mockSelectedDocumentIds }
    const actual = reducer(initialState, action)
    expect(actual.get('selectedDocuments')).toEqual(mockSelectedDocumentIds)
  })

  it('should set selectedDocumentTypes in response to SELECT_DOCUMENT_TYPE action', () => {
    const mockSelectedDocumentTypeIds: string[] = [mockType.id]
    const action: SelectDocumentType = {
      type: DocumentActionType.SELECT_DOCUMENT_TYPE,
      payload: mockSelectedDocumentTypeIds
    }
    const actual = reducer(initialState, action)
    expect(actual.get('selectedDocumentTypes')).toEqual(mockSelectedDocumentTypeIds)
  })

  it('visibleDocuments returns subset of documents filtered by state.filter', () => {
    const actual = visibleDocuments(initialState)
    expect(actual).toEqual([])
  })

  it('visibleDocuments returns state.documentsSearchResult if state.filter.search is defined', () => {
    const mockDocumentsSearchResult: Document[] = [mockDocument]
    const stateWithSearchTermFields: DocumentsStateFields = {
      ...mockStateFields,
      ...{ documentsSearchResult: mockDocumentsSearchResult, allDocuments: mockDocumentsSearchResult }
    }
    stateWithSearchTermFields.filters.search = 'AML Letter - test'

    const mockStateWithSearchTerm: DocumentsState = immutable.Map(stateWithSearchTermFields)

    const actual = visibleDocuments(mockStateWithSearchTerm)
    expect(actual).toEqual(mockDocumentsSearchResult)
  })

  it('visibleDocuments returns state.allDocuments filtered by document.sharedWith counter if state.filter.selectedCounterparty is defined', () => {
    const mockSharedDocument: Document = {
      ...mockDocument,
      ...{ sharedWith: [{ counterpartyId: '123', sharedDates: [mockedDate] }] }
    }
    const stateWithSharedDocument: DocumentsStateFields = {
      ...mockStateFields,
      ...{ allDocuments: [mockSharedDocument] }
    }
    stateWithSharedDocument.filters.selectedCounterparty = '321'

    const mockStateWithSharedDocument: DocumentsState = immutable.Map(stateWithSharedDocument)

    const actual = visibleDocuments(mockStateWithSharedDocument)
    expect(actual).toEqual([])
  })

  it('updates sharedWith values from sharing result', async () => {
    const company = 'company'
    const currentState = initialState.set('allDocuments', [mockDocument])
    const result = reducer(currentState, documentSharedWith(COMPANY_ID, company))

    const firstDocument = result.get('allDocuments')[0]
    expect(firstDocument.sharedWith).toEqual([sharedDates, transformStringIntoSharedWith(company)])
  })

  it('merges sharedWith values from sharing result coming out of order', async () => {
    const company1 = 'company1'
    const company2 = 'company2'

    const currentState = initialState.set('allDocuments', [mockDocument])

    const newState = reducer(currentState, documentSharedWith(COMPANY_ID, company1, company2))
    const result = reducer(newState, documentSharedWith(COMPANY_ID, company1))
    const firstDocument = result.get('allDocuments')[0]

    expect(firstDocument.sharedWith).toEqual([
      transformStringIntoSharedWith(COMPANY_ID, mockedDate),
      transformStringIntoSharedWith(company1),
      transformStringIntoSharedWith(company2)
    ])
  })

  it('should store doc filter in documentListFilter variable when SET_DOCUMENT_LIST_FILTER action is dispatched', () => {
    const action = {
      type: DocumentActionType.SET_DOCUMENT_LIST_FILTER,
      payload: {
        type: ['123']
      }
    }
    const newState = reducer(initialState, action)

    expect(newState.get('documentListFilter')).toEqual({
      type: ['123']
    })
  })

  it('should store counteparty list filter in counterpartyDocsFilter variable when SET_COUNTERPARTY_DOCS_FILTER action is dispatched', () => {
    const action = {
      type: DocumentActionType.SET_COUNTERPARTY_DOCS_FILTER,
      payload: {
        filter: { type: ['123'] },
        counterpartyId: '123'
      }
    }
    const newState = reducer(initialState, action)

    expect(newState.get('counterpartyDocsFilter')).toEqual({
      filter: { type: ['123'] },
      counterpartyId: '123'
    })
  })

  function transformStringIntoSharedWith(counterparty: string, date?: Date) {
    return { counterpartyId: counterparty, sharedDates: date ? [date] : [] }
  }

  function documentSharedWith(...originalSharedWith: string[]): SendDocumentsSuccess {
    const sharedWith = originalSharedWith.map(x => transformStringIntoSharedWith(x))
    return {
      type: DocumentActionType.SEND_DOCUMENTS_SUCCESS,
      payload: [
        {
          ...mockDocument,
          sharedWith
        }
      ]
    }
  }
})
