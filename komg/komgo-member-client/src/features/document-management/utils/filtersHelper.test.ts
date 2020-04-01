import * as helpers from './filtersHelper'
import { DocumentListFilter, CounterpartyDocumentFilter } from '../store/types/document'
import { DocumentsFilters } from '../store/types/state'

describe('isFilterApplied', () => {
  const defaultDocListFilter: DocumentListFilter = {
    type: [],
    sharedWith: []
  }

  const defaultDocFilter: DocumentsFilters = {
    selectedCategoryId: '',
    selectedCounterparty: '',
    search: '',
    parcel: '',
    shared: ''
  }

  it('should return true when filter type is applied', () => {
    expect(helpers.isFilterApplied({ ...defaultDocListFilter, type: ['11'] }, defaultDocFilter)).toBe(true)
  })
  it('should return true when filter sharedWith is applied', () => {
    expect(helpers.isFilterApplied({ ...defaultDocListFilter, sharedWith: ['11'] }, defaultDocFilter)).toBe(true)
  })
  it('should return true when search filter is applied', () => {
    expect(helpers.isFilterApplied(defaultDocListFilter, { ...defaultDocFilter, search: '123' })).toBe(true)
  })
  it('should return false there are not applied filters', () => {
    expect(helpers.isFilterApplied(defaultDocListFilter, defaultDocFilter)).toBe(false)
  })
  it('should return false when list filter is null and search is empty string', () => {
    expect(helpers.isFilterApplied(null, defaultDocFilter)).toBe(false)
  })
})

describe('isCounterpartyDocsFilterApplied', () => {
  const defaultCounterpartyListFilter: CounterpartyDocumentFilter = {
    type: []
  }

  const defaultDocFilter: DocumentsFilters = {
    selectedCategoryId: '',
    selectedCounterparty: '',
    search: '',
    parcel: '',
    shared: ''
  }

  it('should return true when filter type is applied', () => {
    expect(
      helpers.isCounterpartyDocsFilterApplied({ ...defaultCounterpartyListFilter, type: ['11'] }, defaultDocFilter)
    ).toBe(true)
  })
  it('should return true when search filter is applied', () => {
    expect(
      helpers.isCounterpartyDocsFilterApplied(defaultCounterpartyListFilter, { ...defaultDocFilter, search: '123' })
    ).toBe(true)
  })
  it('should return false there are not applied filters', () => {
    expect(helpers.isCounterpartyDocsFilterApplied(defaultCounterpartyListFilter, defaultDocFilter)).toBe(false)
  })
  it('should return false when list filter is null and search is empty string', () => {
    expect(helpers.isCounterpartyDocsFilterApplied(null, defaultDocFilter)).toBe(false)
  })
})
