import { DocumentsState } from '../store/types'
import { Document } from '../store/types/document'
import { MapDocumentsToDocumentTypeId } from '../components/documents/my-documents/toMap'
import { BottomSheetStatus } from '../../bottom-sheet/store/types'
import {
  isFilteredBySharedWith,
  isFilteredByParcel,
  isFilteredBySharedBy,
  isFilteredBySearch,
  inFilteredByNotSharedBy
} from './filtersHelper'
import { SubProducts } from '../constants/SubProducts'
import _ from 'lodash'

export function combinePredicates<T>(p1: (item: T) => boolean, p2: (item: T) => boolean) {
  return item => p1(item) && p2(item)
}

export const filterOwnDocumentList = (documentsState: DocumentsState): Document[] => {
  const filter = documentsState.get('documentListFilter')

  if (!filter) {
    return filterDocuments(documentsState)
  }

  let predicate: (document: Document) => boolean = (document: Document) => true

  if (filter.type && filter.type.length) {
    predicate = combinePredicates(predicate, document => {
      return filter.type.includes(document.type.id)
    })
  }

  if (filter.sharedWith && filter.sharedWith.length) {
    predicate = combinePredicates(predicate, document =>
      _.some(filter.sharedWith, c => document.sharedWith && document.sharedWith.map(s => s.counterpartyId).includes(c))
    )
  }
  // NOTE: other filters will be added

  return filterDocuments(documentsState, predicate)
}

export const filterCounterpartyDocumentList = (documentsState: DocumentsState): Document[] => {
  const filterWrap = documentsState.get('counterpartyDocsFilter')

  if (!filterWrap || !filterWrap.filter) {
    return filterDocuments(documentsState)
  }

  const filter = filterWrap.filter

  let predicate: (document: Document) => boolean = (document: Document) => true

  if (filter.type && filter.type.length) {
    predicate = combinePredicates(predicate, document => {
      return filter.type.includes(document.type.id)
    })
  }

  if (filter.reviewStatus && filter.reviewStatus.length) {
    predicate = combinePredicates(predicate, document => {
      return document.sharedInfo && filter.reviewStatus.includes(document.sharedInfo.status)
    })
  }

  if (filter.reviewedBy && filter.reviewedBy.length) {
    predicate = combinePredicates(predicate, document => {
      return document.sharedInfo && filter.reviewedBy.includes(document.sharedInfo.reviewerId)
    })
  }
  // NOTE: other filters will be added

  return filterDocuments(documentsState, predicate)
}

const filterDocuments = (documentsState: DocumentsState, predicate?: (item: Document) => boolean) => {
  const filters = documentsState.get('filters')
  let docsToFilter = documentsState.get('allDocuments')

  if (isFilteredBySearch(filters)) {
    docsToFilter = documentsState.get('documentsSearchResult')
  }

  const documentFiltered = [...docsToFilter]

  if (!predicate || !documentFiltered.length) {
    return documentFiltered
  }

  return documentFiltered.filter(predicate)
}

// TODO: AJ instead of iterating once per condition, compose filters and iterate once.
export const visibleDocuments = (documentsState: DocumentsState): Document[] => {
  const filters = documentsState.get('filters')

  const allDocuments = documentsState.get('allDocuments')
  let documentFiltered = [...allDocuments]
  if (isFilteredBySharedWith(filters)) {
    documentFiltered = documentFiltered.filter(
      document => document.sharedWith.map(x => x.counterpartyId).indexOf(filters.selectedCounterparty) !== -1
    )
  }
  if (isFilteredByParcel(filters)) {
    documentFiltered = documentFiltered.filter(document => getDocumentParcelId(document) === filters.parcel)
  }
  if (isFilteredBySharedBy(filters)) {
    documentFiltered = documentFiltered.filter(document => getDocumentSharedBy(document) !== 'none')
  } else if (inFilteredByNotSharedBy(filters)) {
    documentFiltered = documentFiltered.filter(document => getDocumentSharedBy(document) === 'none')
  }

  const finalDocs = documentFiltered.filter(filterUnregisteredDocuments)

  if (isFilteredBySearch(filters)) {
    // The user has also search by name in the search bar
    const idFilteredSearchDocs: string[] = documentsState.get('documentsSearchResult').map(d => d.id)
    return finalDocs.filter(d => idFilteredSearchDocs.includes(d.id))
  }
  return finalDocs
}

export const getSelectedDocuments = (documents: Document[], selectedDocuments: string[]): Document[] => {
  const documentsObj: Document[] = []
  documents.forEach(document => {
    if (selectedDocuments.indexOf(document.id) !== -1) {
      documentsObj.push(document)
    }
  })
  return documentsObj
}

export const getDocumentOwner = (document: Document): string => {
  let name = ''
  if (document.owner && document.owner.firstName !== '-') {
    name += document.owner.firstName
  }
  if (document.owner && document.owner.lastName !== '-') {
    name += ` ${document.owner.lastName}`
  }
  return name
}

export const getDocumentParcelId = (document: Document): string => {
  if (!document.metadata) {
    return ''
  }
  const parcel = document.metadata.filter(item => item.name === 'parcelId')
  if (!parcel.length) {
    return ''
  }
  return parcel[0].value
}

export const getDocumentSharedBy = (document: Document): string => {
  return document.sharedBy ? document.sharedBy : ''
}

export const isEmptyLibrary = (library: MapDocumentsToDocumentTypeId): boolean => {
  return library.get('all').length === 0
}

export const onlyRegisteredDocuments = (library: MapDocumentsToDocumentTypeId): MapDocumentsToDocumentTypeId => {
  return new Map(
    Array.from(library.entries()).map<[string, Document[]]>(([documentType, documents]) => [
      documentType,
      documents.filter(filterUnregisteredDocuments)
    ])
  )
}

export const filterUnregisteredDocuments = (doc: Document) => doc.state === BottomSheetStatus.REGISTERED

export const isRD = (doc: Document) =>
  doc.context && (doc.context as any).subProductId === SubProducts.ReceivableDiscounting
