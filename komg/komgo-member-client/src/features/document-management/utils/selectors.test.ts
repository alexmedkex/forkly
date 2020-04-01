import { mockDocuments } from '../store/documents/mock-data'
import { BottomSheetStatus } from '../../bottom-sheet/store/types'

import * as selectors from './selectors'
import { fakeDocument } from './faker'
import { DocumentsStateFields, CounterpartyDocumentFilterWrap } from '../store/types'
import * as immutable from 'immutable'
import { mockDocs } from '../containers/mockedConstants'

describe('selectors utils', () => {
  it('should return owner first and last name', () => {
    const actual = selectors.getDocumentOwner(mockDocuments[0])
    const expected = `${mockDocuments[0].owner.firstName} ${mockDocuments[0].owner.lastName}`
    expect(actual).toEqual(expected)
  })
  it('should return owner first and last name', () => {
    const document = mockDocuments[0]
    document.owner.firstName = '-'
    document.owner.lastName = '-'
    const actual = selectors.getDocumentOwner(document)
    const expected = ''
    expect(actual).toEqual(expected)
  })
  it('should return parcelId', () => {
    const document = mockDocuments[0]
    document.metadata.push({ name: 'parcelId', value: '123' })
    expect(selectors.getDocumentParcelId(document)).toEqual('123')
  })

  it('filterUnregisteredDocuments filters unregistered documents...', () => {
    const anonDocs = [
      fakeDocument({ id: '1', state: BottomSheetStatus.REGISTERED }),
      fakeDocument({ id: '2', state: BottomSheetStatus.PENDING }),
      fakeDocument({ id: '3', state: BottomSheetStatus.FAILED })
    ]

    const actual = anonDocs.filter(selectors.filterUnregisteredDocuments)
    expect(actual).toHaveLength(1)

    const [registered] = actual
    expect(registered).toHaveProperty('id', '1')
  })

  it('If we dont filter anything we should retrieve the same set of documents', () => {
    const anonDocs = [
      fakeDocument({
        id: '1',
        sharedWith: [{ counterpartyId: '1', sharedDates: [] }],
        state: BottomSheetStatus.REGISTERED
      }),
      fakeDocument({
        id: '2',
        sharedWith: [{ counterpartyId: '2', sharedDates: [] }],
        state: BottomSheetStatus.REGISTERED
      }),
      fakeDocument({
        id: '3',
        sharedWith: [{ counterpartyId: '1', sharedDates: [] }],
        state: BottomSheetStatus.REGISTERED
      })
    ]
    const docState: DocumentsStateFields = {
      allDocuments: anonDocs,
      documentsById: undefined,
      documentsSet: immutable.Set(anonDocs),
      documentsSearchResult: [],
      isLoading: false,
      isLoadingDocuments: false,
      selectedDocuments: [],
      selectedDocumentTypes: [],
      documentListFilter: null,
      counterpartyDocsFilter: null,
      filters: {
        selectedCategoryId: '',
        selectedCounterparty: 'none',
        search: '',
        parcel: 'all',
        shared: ''
      },
      error: undefined,
      counterpartyFilter: undefined
    }

    const actual = selectors.visibleDocuments(immutable.Map(docState))
    expect(actual).toHaveLength(3)
    expect(actual).toEqual(anonDocs)
  })

  it('SharedWith filter should return the documents shared only with a specific counterparty', () => {
    const anonDocs = [
      fakeDocument({
        id: '1',
        sharedWith: [{ counterpartyId: '1', sharedDates: [] }],
        state: BottomSheetStatus.REGISTERED
      }),
      fakeDocument({
        id: '2',
        sharedWith: [{ counterpartyId: '2', sharedDates: [] }],
        state: BottomSheetStatus.REGISTERED
      }),
      fakeDocument({
        id: '3',
        sharedWith: [{ counterpartyId: '1', sharedDates: [] }],
        state: BottomSheetStatus.REGISTERED
      })
    ]
    const docState: DocumentsStateFields = {
      allDocuments: anonDocs,
      documentsSet: immutable.Set(anonDocs),
      documentsById: undefined,
      documentsSearchResult: [],
      isLoading: false,
      isLoadingDocuments: false,
      selectedDocuments: [],
      selectedDocumentTypes: [],
      documentListFilter: null,
      counterpartyDocsFilter: null,
      filters: {
        selectedCategoryId: '',
        selectedCounterparty: '1',
        search: '',
        parcel: 'all',
        shared: ''
      },
      error: undefined,
      counterpartyFilter: undefined
    }

    const actual = selectors.visibleDocuments(immutable.Map(docState))
    expect(actual).toHaveLength(2)
    expect(actual).toEqual(anonDocs.filter(x => x.id === '1' || x.id === '3'))
  })

  it('the search filter should apply ONLY after all the rest of filters are done (in this case sharedWith)', () => {
    const doc = fakeDocument({
      id: '3',
      name: 'ccc',
      sharedWith: [{ counterpartyId: '1', sharedDates: [] }],
      state: BottomSheetStatus.REGISTERED
    })
    const anonDocs = [
      fakeDocument({
        id: '1',
        name: 'aaa',
        sharedWith: [{ counterpartyId: '1', sharedDates: [] }],
        state: BottomSheetStatus.REGISTERED
      }),
      fakeDocument({
        id: '2',
        name: 'bbb',
        sharedWith: [{ counterpartyId: '2', sharedDates: [] }],
        state: BottomSheetStatus.REGISTERED
      }),
      doc
    ]
    const docState: DocumentsStateFields = {
      allDocuments: anonDocs,
      documentsSet: immutable.Set(anonDocs),
      documentsById: undefined,
      documentsSearchResult: [doc],
      isLoading: false,
      isLoadingDocuments: false,
      selectedDocuments: [],
      selectedDocumentTypes: [],
      documentListFilter: null,
      counterpartyDocsFilter: null,
      filters: {
        selectedCategoryId: '',
        selectedCounterparty: '1',
        search: 'ccc',
        parcel: '',
        shared: ''
      },
      error: undefined,
      counterpartyFilter: undefined
    }

    const actual = selectors.visibleDocuments(immutable.Map(docState))
    expect(actual).toHaveLength(1)
    expect(actual).toEqual(anonDocs.filter(x => x.id === '3'))
  })

  it('the search filter should work even if there is no other filter defined', () => {
    const doc = fakeDocument({
      id: '3',
      name: 'ccc',
      sharedWith: [{ counterpartyId: '1', sharedDates: [] }],
      state: BottomSheetStatus.REGISTERED
    })
    const anonDocs = [
      fakeDocument({
        id: '1',
        name: 'aaa',
        sharedWith: [{ counterpartyId: '1', sharedDates: [] }],
        state: BottomSheetStatus.REGISTERED
      }),
      fakeDocument({
        id: '2',
        name: 'bbb',
        sharedWith: [{ counterpartyId: '2', sharedDates: [] }],
        state: BottomSheetStatus.REGISTERED
      }),
      doc
    ]
    const docState: DocumentsStateFields = {
      allDocuments: anonDocs,
      documentsById: undefined,
      documentsSet: immutable.Set(anonDocs),
      documentsSearchResult: [doc],
      isLoading: false,
      isLoadingDocuments: false,
      selectedDocuments: [],
      selectedDocumentTypes: [],
      documentListFilter: null,
      counterpartyDocsFilter: null,
      filters: {
        selectedCategoryId: '',
        selectedCounterparty: '',
        search: 'ccc',
        parcel: '',
        shared: ''
      },
      error: undefined,
      counterpartyFilter: undefined
    }

    const actual = selectors.visibleDocuments(immutable.Map(docState))
    expect(actual).toHaveLength(1)
    expect(actual).toEqual([doc])
  })
})

describe('combinePredicates', () => {
  it('should combine two functions', () => {
    const f1 = (t: any) => t
    const f2 = (t: any) => t

    const newFunction = selectors.combinePredicates(f1, f2)

    expect(newFunction(true)).toBe(true)
    expect(newFunction(false)).toBe(false)
  })
})

describe('filterOwnDocumentList', () => {
  it('should filter docments', () => {
    const documentListFilters = {
      type: ['1'],
      sharedWith: []
    }
    const mockDocuments = mockDocs.map(document => ({ ...document, registrationDate: '2019-08-12T09:18:29.662Z' }))
    const documentState = immutable.Map({
      documentListFilter: documentListFilters,
      allDocuments: mockDocuments,
      filters: { search: '' }
    })

    expect(selectors.filterOwnDocumentList(documentState as any)).toMatchSnapshot()
  })

  it('should return empty array when document with type id does not exist', () => {
    const documentListFilters = {
      type: ['1123'],
      sharedWith: []
    }
    const documentState = immutable.Map({
      documentListFilter: documentListFilters,
      allDocuments: mockDocs,
      filters: { search: '' }
    })

    expect(selectors.filterOwnDocumentList(documentState as any).length).toBe(0)
  })
})

describe('filterCounterpartyDocumentList', () => {
  it('should filter docments', () => {
    const categoryFilter: CounterpartyDocumentFilterWrap = {
      counterpartyId: '123',
      filter: {
        type: ['1']
      }
    }
    const mockDocuments = mockDocs.map(document => ({ ...document, registrationDate: '2019-08-12T09:18:29.662Z' }))
    const documentState = immutable.Map({
      counterpartyDocsFilter: categoryFilter,
      allDocuments: mockDocuments,
      filters: { search: '' }
    })

    expect(selectors.filterCounterpartyDocumentList(documentState as any).length).toBe(1)
    expect(selectors.filterCounterpartyDocumentList(documentState as any)).toMatchSnapshot()
  })

  it('should return empty array when document with type id does not exist', () => {
    const categoryFilter: CounterpartyDocumentFilterWrap = {
      counterpartyId: '123',
      filter: {
        type: ['211211']
      }
    }
    const mockDocuments = mockDocs.map(document => ({ ...document, registrationDate: '2019-08-12T09:18:29.662Z' }))
    const documentState = immutable.Map({
      counterpartyDocsFilter: categoryFilter,
      allDocuments: mockDocuments,
      filters: { search: '' }
    })

    expect(selectors.filterCounterpartyDocumentList(documentState as any).length).toBe(0)
  })
})
