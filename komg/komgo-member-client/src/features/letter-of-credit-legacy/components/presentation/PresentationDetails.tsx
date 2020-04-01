import * as React from 'react'
import styled from 'styled-components'
import { Header, Divider, Button, Label } from 'semantic-ui-react'
import { Document } from '../../../document-management/store/types'
import { ILCPresentation } from '../../types/ILCPresentation'
import DocumentsList from './DocumentsList'
import { IMember } from '../../../members/store/types'
import { IFullDocumentReviewResponse, ReviewStatus } from '../../../review-documents/store/types'
import { mapDocReviewStatusesToPresentationDocStatues } from '../../constants'

export interface IProps {
  presentation: ILCPresentation
  documents: Document[]
  members: IMember[]
  documentsReview: IFullDocumentReviewResponse[]
  documentViewClickHandler?: (document: Document) => void
  documentReviewClickHandler?: (document: Document) => void
}

class PresentationDetails extends React.Component<IProps> {
  renderDocumentReview = (document: Document) => {
    const { documentsReview, documentReviewClickHandler } = this.props
    const [documentReviewed] = documentsReview.filter(d => d.document.id === document.id)
    if (documentReviewed && documentReviewed.status === 'pending') {
      return (
        <Button
          size="small"
          floated="right"
          style={{ marginTop: '-5px', marginRight: '2px' }}
          onClick={() => documentReviewClickHandler(document)}
        >
          Review
        </Button>
      )
    } else if (documentReviewed && documentReviewed.status === ReviewStatus.ACCEPTED) {
      return <Label color="green">{mapDocReviewStatusesToPresentationDocStatues[ReviewStatus.ACCEPTED]}</Label>
    } else if (documentReviewed && documentReviewed.status === ReviewStatus.REJECTED) {
      return <Label color="red">{mapDocReviewStatusesToPresentationDocStatues[ReviewStatus.REJECTED]}</Label>
    }
    return null
  }

  render() {
    const { presentation, documents, documentViewClickHandler, documentReviewClickHandler } = this.props
    return (
      <StyledWrapper>
        <Divider />
        {documents &&
          documents.length > 0 && (
            <DocumentsList
              documents={documents}
              presentation={presentation}
              showActions={true}
              viewClickHandler={documentViewClickHandler}
              removeDeleteButton={true}
              renderDocumentReview={this.renderDocumentReview}
            />
          )}
        <Divider />
        <Header as="h4">
          <b>Comment</b>
        </Header>
        {presentation.beneficiaryComments && (
          <Comment>
            {presentation.beneficiaryComments}
            <Divider />
          </Comment>
        )}
      </StyledWrapper>
    )
  }
}

const StyledWrapper = styled.div`
  margin: 50px 0;
`

export const Comment = styled.div``

export default PresentationDetails
