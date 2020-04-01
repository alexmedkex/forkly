import { connect } from 'react-redux'
import {
  DocumentTypeActions,
  DocumentType,
  ProductId,
  DocumentTypeCreateRequest,
  DocumentTypeUpdateRequest
} from '../store'
import { ApplicationState } from '../../../store/reducers'

interface StateProps {
  documentTypes: DocumentType[]
  isLoadingDocumentTypes: boolean
}

interface DispatchProps {
  fetchDocumentTypesAsync(productId: ProductId, categoryId?: string): void
  fetchDocumentTypeById(documentTypeId: string, productId: ProductId)
  createDocumentTypeAsync(documentType: DocumentTypeCreateRequest, productId: ProductId)
  updateDocumentTypeAsync(documentType: DocumentTypeUpdateRequest, productId: ProductId)
  deleteDocumentTypeAsync(typeId: string, productId: ProductId)
}

export type WithDocumentTypesProps = StateProps & DispatchProps

const mapStateToProps = (state: ApplicationState): StateProps => {
  const documentTypesState = state.get('documentTypes')
  return {
    documentTypes: documentTypesState.get('documentTypes'),
    isLoadingDocumentTypes: documentTypesState.get('isLoadingDocumentTypes')
  }
}

const withDocumentTypes = (Wrapped: React.ComponentType) =>
  connect<StateProps, DispatchProps, {}>(mapStateToProps, {
    fetchDocumentTypesAsync: DocumentTypeActions.fetchDocumentTypesAsync,
    fetchDocumentTypeById: DocumentTypeActions.fetchDocumentTypeByIdAsync,
    createDocumentTypeAsync: DocumentTypeActions.createDocumentTypeAsync,
    updateDocumentTypeAsync: DocumentTypeActions.updateDocumentTypeAsync,
    deleteDocumentTypeAsync: DocumentTypeActions.deleteDocumentTypeAsync
  })(Wrapped)

export default withDocumentTypes
