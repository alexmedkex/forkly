import * as immutable from 'immutable'
import * as _ from 'lodash'
import { Reducer } from 'redux'
import { updateItemStatus } from '../../../bottom-sheet/store/reducer'
import { BottomSheetStatus } from '../../../bottom-sheet/store/types'
import {
  Document,
  DocumentActionType,
  DocumentsAction,
  DocumentsFilters,
  DocumentsState,
  DocumentsStateFields,
  NormalizedDocuments
} from '../types'

export const initialDocumentsFilters: DocumentsFilters = {
  selectedCategoryId: 'all',
  selectedCounterparty: 'all_documents',
  search: '',
  parcel: 'all',
  shared: 'all'
}

export const initialNormalizedDocumentsState: NormalizedDocuments = {
  ids: new Set(),
  categoryIds: new Set(),
  productIds: new Set(),
  subProductIds: new Set(),
  sharedWithIds: new Set(),
  sharedByIds: new Set(),
  byId: new Map(),
  byCategoryId: new Map(),
  byProductId: new Map(),
  bySubProductId: new Map(),
  bySharedById: new Map(),
  bySharedWithId: new Map()
}

export const initialStateFields: DocumentsStateFields = {
  allDocuments: [],
  documentsById: immutable.Map(),
  documentsSet: immutable.Set<Document>(),
  documentsSearchResult: [],
  isLoadingDocuments: false,
  isLoading: false,
  error: null,
  selectedDocuments: [],
  selectedDocumentTypes: [],
  filters: initialDocumentsFilters,
  documentListFilter: null,
  counterpartyDocsFilter: null,
  counterpartyFilter: null
}

export const initialState: any = immutable.Map(initialStateFields)

const selectHelperReducer = (state: DocumentsState = initialState, action: DocumentsAction): DocumentsState | null => {
  switch (action.type) {
    case DocumentActionType.SELECT_DOCUMENT:
      return state.set('selectedDocuments', action.payload)
    case DocumentActionType.SELECT_DOCUMENT_TYPE:
      return state.set('selectedDocumentTypes', action.payload)
    case DocumentActionType.CHANGE_DOCUMENT_FILTER:
      return state.set('filters', { ...state.get('filters'), [action.payload.filter]: action.payload.value })
    case DocumentActionType.SET_DOCUMENT_LIST_FILTER:
      return state.set('documentListFilter', { ...action.payload })
    case DocumentActionType.SET_COUNTERPARTY_DOCS_FILTER:
      return state.set('counterpartyDocsFilter', { ...action.payload })
    case DocumentActionType.RESET_DOCUMENTS_SELECT_DATA:
      return state
        .set('filters', initialDocumentsFilters)
        .set('selectedDocuments', [])
        .set('selectedDocumentTypes', [])
    default:
      return null
  }
}

const filterCounterpartyDocsReducer = (
  state: DocumentsState = initialState,
  action: DocumentsAction
): DocumentsState | null => {
  switch (action.type) {
    case DocumentActionType.SET_COUNTERPARTY_FILTER:
      return state.set('counterpartyFilter', action.payload)
    default:
      return null
  }
}

// Workaround for cyclomatic complexity limitation in Sonarqube
const searchReducer: Reducer<DocumentsState> = (state = initialState, action: DocumentsAction): DocumentsState => {
  switch (action.type) {
    case DocumentActionType.FETCH_DOCUMENTS_SUCCESS: {
      return state
        .set('allDocuments', action.payload)
        .set('documentsById', state.get('documentsById'))
        .set('documentsSet', state.get('documentsSet').union(action.payload))
    }
    case DocumentActionType.SEARCH_DOCUMENTS_START: {
      return state.set('isLoading', true)
    }
    case DocumentActionType.SEARCH_DOCUMENTS_SUCCESS: {
      return state
        .set(
          'documentsSearchResult',
          action.payload.filter(document => document.state === BottomSheetStatus.REGISTERED)
        )
        .set('isLoading', false)
    }
    case DocumentActionType.SEARCH_DOCUMENTS_ERROR: {
      return state.set('error', action.error).set('isLoading', false)
    }
    default:
      return crudReducer(state, action)
  }
}

const crudReducer: Reducer<DocumentsState> = (state = initialState, action: DocumentsAction): DocumentsState => {
  switch (action.type) {
    case DocumentActionType.DELETE_DOCUMENT_ERROR: {
      return state.set('error', action.error)
    }
    case DocumentActionType.DELETE_DOCUMENT_SUCCESS: {
      return state
        .set('allDocuments', state.get('allDocuments').filter(document => document.id !== action.payload.id))
        .set('documentsById', state.get('documentsById').remove(action.payload.id))
        .set('documentsSet', state.get('documentsSet').subtract([action.payload]))
    }
    case DocumentActionType.CREATE_DOCUMENT_ERROR: {
      return state
    }
    case DocumentActionType.CREATE_DOCUMENT_SUCCESS: {
      const docsByIdUpdate = state.get('documentsById').set(action.payload.id, action.payload)
      return state
        .set('allDocuments', [...state.get('allDocuments'), action.payload])
        .set('documentsById', docsByIdUpdate)
        .set('filters', initialDocumentsFilters)
        .set('documentsSet', state.get('documentsSet').add(action.payload))
    }
    case DocumentActionType.SHOW_DOCUMENT_REGISTERED_ERROR:
    case DocumentActionType.SHOW_DOCUMENT_REGISTERED_SUCCESS: {
      const updatedDocsById = state.get('documentsById').map(updateItemStatus(action.payload)) as immutable.Map<
        string,
        Document
      >
      return state
        .set('allDocuments', state.get('allDocuments').map(updateItemStatus(action.payload)) as Document[])
        .set('documentsById', updatedDocsById)
        .set(
          'documentsSet',
          immutable.Set(
            state.get('documentsSet').map(doc => {
              if (doc.id === action.payload.id) {
                doc.state = action.payload.state
              }
              return doc
            })
          )
        )
    }
    default:
      return state
  }
}

const reducer: Reducer<DocumentsState> = (state = initialState, action: DocumentsAction): DocumentsState => {
  const select = selectHelperReducer(state, action)
  if (select) {
    return select
  }

  const updated = filterCounterpartyDocsReducer(state, action)

  if (updated) {
    return updated
  }

  switch (action.type) {
    case DocumentActionType.START_FETCHING_DOCUMENTS:
      return state.set('isLoadingDocuments', true)
    case DocumentActionType.FETCH_DOCUMENTS_SUCCESS: {
      const update = action.payload.reduce(
        (memo: any, document: Document) => ({
          ...memo,
          [document.id]: document
        }),
        {}
      )
      const docs = state.get('documentsById').mergeDeep(immutable.fromJS(update))
      return state
        .set('allDocuments', action.payload)
        .set('isLoadingDocuments', false)
        .set('documentsById', docs)
        .set('documentsSet', state.get('documentsSet').union(action.payload))
    }
    case DocumentActionType.FETCH_DOCUMENTS_ERROR: {
      return state.set('error', action.error).set('isLoadingDocuments', false)
    }
    case DocumentActionType.SEND_DOCUMENTS_SUCCESS: {
      const documents = mergeDocuments(state.get('allDocuments'), action.payload)
      const update = documents.reduce(
        (memo: any, document: Document) => ({
          ...memo,
          [document.id]: document
        }),
        {}
      )
      const docs = state.get('documentsById').mergeDeep(immutable.fromJS(update))

      return state.set('allDocuments', documents).set('documentsById', docs)
    }
    case DocumentActionType.DOWNLOAD_DOCUMENT_ERROR: {
      return state.set('error', action.error)
    }
    case DocumentActionType.DOWNLOAD_DOCUMENT_SUCCESS: {
      return state
    }
    default:
      return searchReducer(state, action)
  }
}

function mergeDocuments(documentsInState: Document[], newDocuments: Document[]) {
  return documentsInState.map(doc => {
    const newDocIndex = newDocuments.find(newDoc => newDoc.id === doc.id)
    if (newDocIndex) {
      const union = _.union(doc.sharedWith, newDocIndex.sharedWith)
      const union2 = Object.entries(
        _.mapValues(_.groupBy(union, 'counterpartyId'), clist => clist.map(x => _.omit(x, 'counterpartyId')))
      )
      const union3 = union2.map(x => ({ counterpartyId: x[0], sharedDates: _.flatten(x[1].map(y => y.sharedDates)) }))
      return {
        ...doc,
        sharedWith: union3
      }
    }

    return doc
  })
}

export default reducer
