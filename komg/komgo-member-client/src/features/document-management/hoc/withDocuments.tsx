import { connect, ActionCreator } from 'react-redux'
import {
  DocumentsActions,
  ProductId,
  SendDocumentsRequest,
  CreateDocumentRequest,
  DeleteDocumentSuccess,
  DocumentsFilters,
  Document,
  DocumentListFilter,
  DocumentsState
} from '../store'
import { ApplicationState } from '../../../store/reducers'
import { visibleDocuments } from '../utils/selectors'
import {
  selectDocument,
  selectDocumentType,
  resetDocumentsSelectData,
  bulkSelectDocuments
} from '../store/documents/actions'
import { mapDocumentsByDocumentTypeId, MapDocumentsToDocumentTypeId } from '../components/documents/my-documents/toMap'
import { Map } from 'immutable'

interface StateProps {
  documentsById: Map<string, Document>
  allDocs: Document[]
  allVisibleDocuments: Document[]
  documentsGroupByType: MapDocumentsToDocumentTypeId
  isLoadingDocuments: boolean
  documentsSearchResult: Document[]
  isLoading: boolean
  filters: DocumentsFilters
  documentListFilter: DocumentListFilter
  selectedDocuments: string[]
}

interface DispatchProps {
  resetDocumentsSelectData(): void
  bulkSelectDocuments(...documentIds: string[]): void
  selectDocumentType(documentTypeId: string, excludedDocumentIds?: string[]): void
  selectDocument(documentId: string): void
  changeDocumentsFilter(filter: string, value: string)
  setDocumentListFilter(filter: DocumentListFilter): void
  downloadDocumentsAsync(documentId: string, productId: string): void
  searchDocumentsAsync(productId: ProductId, query?: string, sharedBy?: string, context?: object): void
  fetchDocumentsAsync(productId: ProductId, optionParams?: string): void
  createDocumentAsync(createDocumentRequest: CreateDocumentRequest, productId: ProductId): void
  fetchDocumentsWithParamsAsync(productId: ProductId, query?: string, sharedBy?: string, context?: any): void
  sendDocumentsAsync(requests: SendDocumentsRequest[], productId: ProductId): void
  deleteDocumentAsync(productId: ProductId, documentId: string, onSuccess: ActionCreator<DeleteDocumentSuccess>): void
}

export type WithDocumentsProps = StateProps & DispatchProps

export interface WithDocumentsOptions {
  filterDocuments?: (documentsState: DocumentsState) => Document[]
}

const mapStateToProps = (state: ApplicationState, options: WithDocumentsOptions): StateProps => {
  const documentsState = state.get('documents')

  const filteredDocuments =
    !options || !options.filterDocuments ? visibleDocuments(documentsState) : options.filterDocuments(documentsState)

  return {
    documentsById: documentsState.get('documentsById'),
    allDocs: documentsState.get('allDocuments'),
    allVisibleDocuments: filteredDocuments,
    documentsGroupByType: mapDocumentsByDocumentTypeId(filteredDocuments),
    isLoadingDocuments: documentsState.get('isLoadingDocuments'),
    documentsSearchResult: documentsState.get('documentsSearchResult'),
    isLoading: documentsState.get('isLoading'),
    filters: documentsState.get('filters'),
    documentListFilter: documentsState.get('documentListFilter'),
    selectedDocuments: documentsState.get('selectedDocuments')
  }
}

const withDocuments = (Wrapped: React.ComponentType, options?: WithDocumentsOptions) =>
  connect<StateProps, DispatchProps, {}>((state: ApplicationState) => mapStateToProps(state, options), {
    createDocumentAsync: DocumentsActions.createDocumentAsync,
    fetchDocumentsAsync: DocumentsActions.fetchDocumentsAsync,
    fetchDocumentsWithParamsAsync: DocumentsActions.fetchDocumentsWithParamsAsync,
    searchDocumentsAsync: DocumentsActions.searchDocumentsAsync,
    sendDocumentsAsync: DocumentsActions.sendDocumentsAsync,
    downloadDocumentsAsync: DocumentsActions.downloadDocumentsAsync,
    changeDocumentsFilter: DocumentsActions.changeDocumentFilter,
    setDocumentListFilter: DocumentsActions.setDocumentListFilter,
    deleteDocumentAsync: DocumentsActions.deleteDocumentAsync,
    selectDocument,
    selectDocumentType,
    resetDocumentsSelectData,
    bulkSelectDocuments
  })(Wrapped)

export default withDocuments
