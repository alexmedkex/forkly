import * as React from 'react'
import { compose } from 'redux'
import withDocumentsReview from '../../../review-documents/hoc/withDocumentsReview'
import { withRouter, RouteComponentProps } from 'react-router'
import { withDocuments } from '../../../document-management/hoc'
import withDocument from '../../../document-management/hoc/withDocument'
import { withLoaders } from '../../../../components/with-loaders'
import { ActionType, IFullDocumentReviewResponse } from '../../../review-documents/store/types'
import ReviewDocumentsFeedback from '../../../review-documents/containers/ReviewDocumentsFeedback'
import { LoadingTransition } from '../../../../components'

interface IProps extends RouteComponentProps<any> {
  isFetching: boolean
  documentsReview: IFullDocumentReviewResponse[]
  documentRaw: string
  documentType: string
  isLoadingContent: boolean
  fetchLCPresentationSubmittedDocWithDocContent(lcId: string, presentationId: string, documentId?: string): void
  fetchDocumentContentAsync(idDoc: string, productId: string): void
}

export class LetterOfCreditPresentationFeedback extends React.Component<IProps> {
  componentDidMount() {
    const { location, match } = this.props
    const documentId = location.state ? location.state.documentId : undefined
    this.props.fetchLCPresentationSubmittedDocWithDocContent(match.params.lcId, match.params.presentationId, documentId)
  }

  render() {
    const { isFetching } = this.props
    if (isFetching) {
      return <LoadingTransition title="Loading documents" />
    }
    return (
      <ReviewDocumentsFeedback
        documentsReview={this.props.documentsReview}
        documentRaw={this.props.documentRaw}
        documentType={this.props.documentType}
        isLoadingContent={this.props.isLoadingContent}
        fetchDocumentContent={this.props.fetchDocumentContentAsync}
        history={this.props.history}
        location={this.props.location}
        isLCPresentationContext={true}
      />
    )
  }
}

export default compose<any>(
  withDocumentsReview,
  withRouter,
  withDocuments,
  withDocument,
  withLoaders({
    actions: [ActionType.FETCH_SUBMITTED_DOCUMENTS_REQUEST]
  })
)(LetterOfCreditPresentationFeedback)
