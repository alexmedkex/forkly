import { DocumentsFilters } from '../store/types/state'
import { DocumentListFilter, CounterpartyDocumentFilter } from '../store/types/document'

export const isFilterApplied = (filter: DocumentListFilter, filters: DocumentsFilters): boolean => {
  return (
    (filter && ((filter.type && filter.type.length > 0) || (filter.sharedWith && filter.sharedWith.length > 0))) ||
    isFilteredBySearch(filters)
  )
}

export const isDocumentLibraryFiltered = (filters: DocumentsFilters): boolean => {
  return (
    filters.search.length > 0 ||
    filters.shared !== 'all' ||
    filters.selectedCategoryId !== 'all' ||
    filters.selectedCounterparty !== 'all_documents'
  )
}

export const isCounterpartyDocsFilterApplied = (
  filter: CounterpartyDocumentFilter,
  filters: DocumentsFilters
): boolean => {
  return (
    (filter &&
      ((filter.type && filter.type.length > 0) ||
        (filter.reviewStatus && filter.reviewStatus.length > 0) ||
        (filter.reviewedBy && filter.reviewedBy.length > 0))) ||
    isFilteredBySearch(filters)
  )
}

export const isFilteredBySharedWith = (filters: DocumentsFilters): boolean => {
  return (
    filters.selectedCounterparty !== '' &&
    filters.selectedCounterparty !== 'all_documents' &&
    filters.selectedCounterparty !== 'none'
  )
}

export const isFilteredByParcel = (filters: DocumentsFilters): boolean => {
  return filters.parcel !== '' && filters.parcel !== 'all'
}

export const isFilteredBySharedBy = (filters: DocumentsFilters): boolean => {
  return filters.shared === 'shared'
}

export const inFilteredByNotSharedBy = (filters: DocumentsFilters): boolean => {
  return filters.shared === 'unshared'
}

export const isFilteredBySearch = (filters: DocumentsFilters): boolean => {
  return filters.search !== ''
}

export const isCounterpartyLibraryFiltered = (filters: DocumentsFilters): boolean => {
  return filters.search.length > 0 || filters.shared !== 'all' || filters.selectedCategoryId !== 'all'
}
