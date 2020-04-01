import * as React from 'react'

import ReviewTable from './ReviewTable'
import { IFullDocumentReviewResponse } from '../store/types'
import { Document } from '../../document-management/store/types'
interface Props {
  documents: IFullDocumentReviewResponse[]
  sendDocumentsRequestId: string
  counterpartyName: string | undefined
  reviewCompleted: boolean
  redirectBackUrl?: string
  onReviewClick(doc: Document): void
}

class ReviewPanel extends React.Component<Props> {
  render() {
    return (
      <ReviewTable
        documents={this.props.documents}
        sendDocumentsRequestId={this.props.sendDocumentsRequestId}
        reviewCompleted={this.props.reviewCompleted}
        onReviewClick={this.props.onReviewClick}
      />
    )
  }
}

export default ReviewPanel
