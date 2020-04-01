import { connect } from 'react-redux'
import { createLetterOfCreditDocumentAsync, attachVaktDocuments } from '../store/presentation/actions'

const withLCDocuments = (Wrapped: React.ComponentType) =>
  connect(null, {
    createLCDocumentAsync: createLetterOfCreditDocumentAsync,
    attachLCVaktDocument: attachVaktDocuments
  })(Wrapped)

export default withLCDocuments
