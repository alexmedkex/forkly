import { connect } from 'react-redux'
import { resetLoadedDocument } from '../store/document/actions'
import { fetchDocumentAsync, fetchDocumentContentAsync } from '../store/documents/actions'
import { ApplicationState } from '../../../store/reducers'
import { DEFAULT_PRODUCT } from '../store'

const mapStateToProps = (state: ApplicationState) => {
  const document = state.get('document')
  return {
    productId: DEFAULT_PRODUCT,
    loadedDocument: document.get('loadedDocument'),
    documentRaw: document.get('documentRaw'),
    documentType: document.get('documentType'),
    isLoadingContent: document.get('isLoadingContent')
  }
}

const withDocumentsReview = (Wrapped: React.ComponentType) =>
  connect(mapStateToProps, {
    fetchDocumentAsync,
    fetchDocumentContentAsync,
    resetLoadedDocument
  })(Wrapped)

export default withDocumentsReview
