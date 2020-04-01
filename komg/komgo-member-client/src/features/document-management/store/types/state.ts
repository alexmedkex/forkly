import { ImmutableMap } from '../../../../utils/types'
import { HasError } from '../../../../utils/types'
import * as immutable from 'immutable'
import { Template } from './template'
import { RequestTemplate } from './request-template'
import { Category } from './category'
import { DocumentType } from './document-type'
import { Product } from './product'
import { Request } from './request'
import { Document, DocumentListFilter, CounterpartyDocumentFilter } from './document'

export interface TemplateStateFields extends HasError {
  templates: Template[]
}
export type TemplateState = ImmutableMap<TemplateStateFields>

export interface RequestTemplateStateFields extends HasError {
  requestTemplates: RequestTemplate[]
}

export type RequestTemplateState = ImmutableMap<RequestTemplateStateFields>

export interface DocumentTypeStateFields extends HasError {
  documentTypes: DocumentType[]
  isLoadingDocumentTypes: boolean
}

export type DocumentTypeState = ImmutableMap<DocumentTypeStateFields>

export interface CategoryStateFields extends HasError {
  categories: Category[]
}

export type CategoryState = ImmutableMap<CategoryStateFields>

export interface ProductStateFields extends HasError {
  products: Product[]
}

export type ProductState = ImmutableMap<ProductStateFields>

export interface RequestStateFields extends HasError {
  outgoingRequests: Request[]
  requests: Request[]
  requestById: Request
  sentDocumentRequestTypes: Map<string, Set<string>>
}

export type RequestState = ImmutableMap<RequestStateFields>

export interface DocumentStateFields extends HasError {
  loadedDocument?: Document
  isLoading: boolean
  isLoadingContent: boolean
  documentRaw: string
  documentType: string
}

export type DocumentState = ImmutableMap<DocumentStateFields>

export interface DocumentsStateFields extends HasError {
  allDocuments: Document[]
  documentsById: immutable.Map<string, Document>
  documentsSet: immutable.Set<Document>
  documentsSearchResult: Document[]
  isLoading: boolean
  isLoadingDocuments: boolean
  selectedDocuments: string[]
  selectedDocumentTypes: string[]
  filters: DocumentsFilters
  documentListFilter: DocumentListFilter
  counterpartyDocsFilter: CounterpartyDocumentFilterWrap
  counterpartyFilter: CounterpartyFilter
}

export interface NormalizedDocuments {
  ids: Set<string>
  categoryIds: Set<string>
  productIds: Set<string>
  subProductIds: Set<string>
  sharedWithIds: Set<string>
  sharedByIds: Set<string>
  byId: Map<string, Document>
  byCategoryId: Map<string, Document[]>
  byProductId: Map<string, Document[]>
  bySubProductId: Map<string, Document[]>
  bySharedWithId: Map<string, Document[]>
  bySharedById: Map<string, Document[]>
}

export interface DocumentsFilters {
  selectedCategoryId: string
  selectedCounterparty: string
  search: string
  parcel: string
  shared: string
}

export interface CounterpartyDocumentFilterWrap {
  counterpartyId: string
  filter: CounterpartyDocumentFilter
}

export type RenewalDateFilterKey = 'all' | 'due30' | 'due60' | 'due90' | 'overdueLt30' | 'overdueGt30' | 'noDate'

export interface CounterpartyFilter {
  renewalDateKey: RenewalDateFilterKey
}

export type DocumentsState = ImmutableMap<DocumentsStateFields>

export interface ModalState {
  visible: boolean
}

export interface SteppedModalState extends ModalState {
  step: number
}

export interface DocumentModals {
  addDocument: ModalState
  shareDocument: SteppedModalState
  addDocumentType: ModalState
  editDocumentType: ModalState
  newRequest: SteppedModalState
  loadTemplate: ModalState
  deleteDocument: ModalState
  manageVerif: ModalState
}
export interface ModalsStateFields {
  modals: DocumentModals
}

export type ModalsState = ImmutableMap<ModalsStateFields>
