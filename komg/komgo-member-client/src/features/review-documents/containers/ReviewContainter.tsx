import * as React from 'react'
import { Header, Modal, Button, Label, Grid, Progress } from 'semantic-ui-react'
import { compose } from 'redux'
import styled from 'styled-components'
import { Link } from 'react-router-dom'
import moment from 'moment'

import ReviewPanel from './ReviewPanel'
import ReviewDocumentsCounter from './ReviewDocumentsCounter'
import { IFullDocumentReviewResponse, ReviewStatus } from '../store/types'

import withDocumentsReview from '../hoc/withDocumentsReview'
import { findCounterpartyByStatic } from '../../letter-of-credit-legacy/utils/selectors'
import withCounterparties from '../../counterparties/hoc/withCounterparties'
import { Counterparty } from '../../counterparties/store/types'
import { Document } from '../../document-management/store/types'
import { fetchCounterpartyName } from '../../document-management/utils/counterpartyHelper'

interface Props {
  history: {
    push(path: any): void
    goBack(): void
  }
  location: {
    state: {
      requestId: string
      redirectBackUrl?: string
    }
  }
  reviewCompleted: boolean
  documentsReview: IFullDocumentReviewResponse[]
  requestId: string
  companyId: string
  counterparties: Counterparty[]
  fetchConnectedCounterpartiesAsync: (params?: {}) => any
  fetchDocumentsReceivedAsync(idReceivedDocumentsRequest: string, productId: string): void
  postCompleteDocumentReviewAsync(idReceivedDocumentsRequest: string): void
  patchDocumentsReviewAsync(idReceivedDocumentsRequest: string, documentsReviewed: IFullDocumentReviewResponse[]): void
}

interface State {
  open: boolean
}

const StyledGrid = styled(Grid)`
  &&& {
    margin-bottom: 15px;
    margin-left: 0;
    margin-right: 0;
  }
`

class ReviewContainer extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      open: true
    }
  }

  componentDidMount(): void {
    if (this.props.location.state) {
      const productId = this.props.location.state.redirectBackUrl ? 'tradeFinance' : 'kyc'
      this.props.fetchDocumentsReceivedAsync(this.props.location.state.requestId, productId)
      this.props.fetchConnectedCounterpartiesAsync()
    }
  }

  saveAndClose = () => {
    this.props.patchDocumentsReviewAsync(this.props.requestId, this.props.documentsReview)
  }

  completeReview = () => {
    this.props.postCompleteDocumentReviewAsync(this.props.requestId)
    this.closeReviewModal()
  }

  closeReviewModal = () => {
    const { location, history } = this.props
    if (location.state && location.state.redirectBackUrl) {
      this.setState({ open: false })
      history.push(location.state.redirectBackUrl)
    } else {
      this.setState({ open: false }, () => history.goBack())
    }
  }

  render() {
    const { location } = this.props
    if (!location.state || !location.state.requestId) {
      return this.renderNoDocuments()
    }
    const counterpartyName = fetchCounterpartyName(this.props.counterparties, this.props.companyId)
    const numDocsReviewed = this.props.documentsReview.filter(doc => doc.status !== ReviewStatus.PENDING).length
    const numTotalDocs = this.props.documentsReview.length
    return (
      <>
        <Modal
          size="large"
          style={{ width: '1080px' }}
          open={this.state.open}
          closeOnDimmerClick={true}
          closeOnEscape={true}
        >
          <Modal.Header>
            <StyledGrid>
              <Grid.Column width={12}>
                <Header as="h1" content={counterpartyName} />
                <Header as="h3" color="grey" style={{ marginTop: '0' }}>
                  {`Documents received on ${this.getDateReceivedDocuments()}`}
                </Header>
              </Grid.Column>
              <Grid.Column width={4} style={{ float: 'right' }}>
                <ReviewDocumentsCounter
                  style={{ float: 'right' }}
                  numDocsReviewed={numDocsReviewed}
                  numTotalDocs={numTotalDocs}
                />
                <Progress
                  className="review-progress"
                  value={numDocsReviewed}
                  total={numTotalDocs}
                  style={{ marginTop: '45px' }}
                />
              </Grid.Column>
            </StyledGrid>
          </Modal.Header>
          <Modal.Content>
            <ReviewPanel
              documents={this.props.documentsReview}
              sendDocumentsRequestId={this.props.requestId}
              counterpartyName={counterpartyName}
              reviewCompleted={this.props.reviewCompleted}
              onReviewClick={(doc: Document) => this.onReviewClick(doc)}
            />
          </Modal.Content>
          <Modal.Actions>
            <Button onClick={() => this.closeReviewModal()} content={`Save & close`} />
            {this.renderReviewCompletedOrActions()}
          </Modal.Actions>
        </Modal>
      </>
    )
  }

  private onReviewClick = (doc: Document) => {
    this.props.history.push({
      pathname: '/evaluation',
      state: {
        documents: this.props.documentsReview,
        documentId: doc.id,
        sendDocumentsRequestId: this.props.requestId,
        redirectBackUrl: this.props.location.state.redirectBackUrl
      }
    })
  }

  private renderNoDocuments = () => {
    return (
      <React.Fragment>
        <Header as="h1" content="Review documents" />
        <Header as="h3" content="No documents for review" textAlign="center" style={{ marginTop: '100px' }} />
      </React.Fragment>
    )
  }

  private renderReviewCompletedOrActions() {
    const documentsForReview = this.props.documentsReview.filter(doc => doc.status === ReviewStatus.PENDING)
    const { location } = this.props
    if (this.props.reviewCompleted) {
      return <Label>Review completed</Label>
    } else if (!location.state.redirectBackUrl) {
      return (
        <Button primary={true} disabled={documentsForReview.length !== 0} floated="right" onClick={this.completeReview}>
          Complete review
        </Button>
      )
    } else if (documentsForReview.length === 0 && location.state.redirectBackUrl) {
      return (
        <Link className="ui primary button" to={location.state.redirectBackUrl}>
          Finish reviewing presentation
        </Link>
      )
    }
    return null
  }

  private getDateReceivedDocuments() {
    if (this.props.documentsReview && this.props.documentsReview.length > 0) {
      return moment(this.props.documentsReview[0].document.receivedDate).format('YYYY-MM-DD')
    }
    return undefined
  }
}

export default compose(withDocumentsReview, withCounterparties)(ReviewContainer)
