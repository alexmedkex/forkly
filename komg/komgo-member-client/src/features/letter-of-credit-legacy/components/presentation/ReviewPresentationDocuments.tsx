import * as React from 'react'
import styled from 'styled-components'
import { Button } from 'semantic-ui-react'
import ReviewPresentationDocumentsForm, { DiscrepantForm } from './ReviewPresentationDocumentsForm'
import { IFullDocumentReviewResponse } from '../../../review-documents/store/types'
import * as H from 'history'
import { ServerError } from '../../../../store/common/types'
import { ILCPresentation } from '../../types/ILCPresentation'
import { IMember } from '../../../members/store/types'

interface IProps {
  documentsReview: IFullDocumentReviewResponse[]
  history: H.History
  location: H.Location
  presentation: ILCPresentation
  requestId: string
  members: IMember[]
  isReviewingPresentation: boolean
  reviewingPresentationError: ServerError[]
  setPresentationDocumentsCompliant(): void
  clearError(action: string): void
  setPresentationDocumentsDiscrepant(data: DiscrepantForm): void
  requestWaiverOfDiscrepancies(data: DiscrepantForm): void
}

interface IState {
  allDocumentsReviewed: boolean
  numberOfAcceptedDocuments: number
  numberOfRejectedDocuments: number
  numberOfPendingDocuments: number
}

class ReviewPresentationDocuments extends React.Component<IProps, IState> {
  static checkDocumentsReviewed(documentsReview: IFullDocumentReviewResponse[]) {
    const pendingDocuments = documentsReview.filter(d => d.status === 'pending')
    const acceptedDocuments = documentsReview.filter(d => d.status === 'accepted')
    const rejectedDocuments = documentsReview.filter(d => d.status === 'rejected')
    return {
      pendingDocuments,
      acceptedDocuments,
      rejectedDocuments
    }
  }

  constructor(props: IProps) {
    super(props)
    const {
      pendingDocuments,
      acceptedDocuments,
      rejectedDocuments
    } = ReviewPresentationDocuments.checkDocumentsReviewed(props.documentsReview)
    this.state = {
      allDocumentsReviewed: pendingDocuments.length === 0,
      numberOfAcceptedDocuments: acceptedDocuments.length,
      numberOfRejectedDocuments: rejectedDocuments.length,
      numberOfPendingDocuments: pendingDocuments.length
    }
  }

  redirectToReview = () => {
    const { requestId } = this.props
    this.props.history.push({
      pathname: '/review',
      state: { requestId, redirectBackUrl: this.props.location.pathname }
    })
  }

  render() {
    const { allDocumentsReviewed, numberOfAcceptedDocuments, numberOfRejectedDocuments } = this.state
    const {
      documentsReview,
      setPresentationDocumentsCompliant,
      presentation,
      clearError,
      history,
      setPresentationDocumentsDiscrepant,
      members,
      requestWaiverOfDiscrepancies,
      isReviewingPresentation,
      reviewingPresentationError
    } = this.props
    return (
      <div>
        {documentsReview.length > 0 && (
          <RedirectToReview>
            <ReviewText>
              {!allDocumentsReviewed && (
                <PTagWithoutMargin>
                  You must review <b>all</b> of the document(s) before marking them as compliant or discrepant.
                </PTagWithoutMargin>
              )}
              <PTagWithoutMargin>
                Currently you have marked {numberOfAcceptedDocuments} document(s) as compliant, and{' '}
                {numberOfRejectedDocuments} as discrepant out of {documentsReview.length} document(s).
              </PTagWithoutMargin>
            </ReviewText>
            <Button primary={true} onClick={this.redirectToReview}>
              Review Presentation
            </Button>
          </RedirectToReview>
        )}
        {documentsReview.length > 0 && (
          <ReviewPresentationDocumentsForm
            setPresentationDocumentsCompliant={setPresentationDocumentsCompliant}
            presentation={presentation}
            clearError={clearError}
            allDocumentsReviewed={allDocumentsReviewed}
            numberOfRejectedDocuments={numberOfRejectedDocuments}
            history={history}
            setPresentationDocumentsDiscrepant={setPresentationDocumentsDiscrepant}
            members={members}
            requestWaiverOfDiscrepancies={requestWaiverOfDiscrepancies}
            isReviewingPresentation={isReviewingPresentation}
            reviewingPresentationError={reviewingPresentationError}
          />
        )}
      </div>
    )
  }
}

export const RedirectToReview = styled.div`
  margin-bottom: 30px;
`

const PTagWithoutMargin = styled.p`
  margin: 0;
`

const ReviewText = styled.div`
  margin-bottom: 15px;
`

export default ReviewPresentationDocuments
