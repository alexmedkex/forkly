import { connect } from 'react-redux'
import {
  fetchDocumentsReceivedAsync,
  postCompleteDocumentReviewAsync,
  patchDocumentsReviewAsync,
  fetchPresentationDocumentsReceived,
  fetchLCPresentationSubmittedDocWithDocContent
} from '../store/actions'
import { ApplicationState } from '../../../store/reducers'
import { fetchDocumentContentAsync } from '../../document-management/store/documents/actions'

const mapStateToProps = (state: ApplicationState) => {
  const documentsToReview = state.get('reviewDocuments')
  const document = state.get('document')
  return {
    documentsReview: documentsToReview.get('documentsReview'),
    requestId: documentsToReview.get('requestId'),
    companyId: documentsToReview.get('companyId'),
    reviewCompleted: documentsToReview.get('reviewCompleted'),
    documentRaw: document.get('documentRaw'),
    documentType: document.get('documentType')
  }
}

const withDocumentsReview = (Wrapped: React.ComponentType) =>
  connect(mapStateToProps, {
    fetchDocumentContentAsync,
    fetchDocumentsReceivedAsync,
    postCompleteDocumentReviewAsync,
    patchDocumentsReviewAsync,
    fetchPresentationDocumentsReceived,
    fetchLCPresentationSubmittedDocWithDocContent
  })(Wrapped)

export default withDocumentsReview
