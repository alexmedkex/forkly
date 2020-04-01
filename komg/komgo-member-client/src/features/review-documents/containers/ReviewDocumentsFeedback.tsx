import * as React from 'react'
import { Grid, Button, Divider } from 'semantic-ui-react'
import * as H from 'history'
import { IFullDocumentReviewResponse, IDocumentReviewStatus } from '../store/types'
import ReviewFeedbackDocumentCounter from '../components/reviewFeedback/ReviewFeedbackDocumentCounter'
import DocumentContentView from '../../document-management/components/documents/DocumentContentView'
import EvaluationNavigatePanel from './evaluation/NavigatePanel'
import EvaluationInfoTable from './evaluation/EvaluationInfoTable'
import { mapDocReviewStatusesToPresentationDocStatues } from '../../letter-of-credit-legacy/constants'

interface IProps {
  documentsReview: IFullDocumentReviewResponse[]
  documentRaw: string
  documentType: string
  isLoadingContent: boolean
  location: H.Location
  history: H.History
  isLCPresentationContext?: boolean
  fetchDocumentContent(idDoc: string, productId: string): void
}

interface IState {
  numberOfDiscrepant: number
  documentSelected: IFullDocumentReviewResponse
  documentSelectedIndex: number
}

class ReviewDocumentsFeedback extends React.Component<IProps, IState> {
  static getNumberOfDiscrepantDocuments(documentsReview: IFullDocumentReviewResponse[]) {
    const discrepantDocuments = documentsReview.filter(d => d.status === IDocumentReviewStatus.REJECTED)
    return discrepantDocuments.length
  }

  static getDefaultSelectedDocument(documentsReview: IFullDocumentReviewResponse[], location: H.Location) {
    const documentId = location.state ? location.state.documentId : undefined
    if (documentId) {
      documentsReview.forEach((doc, index) => {
        if (doc.document.id === documentId) {
          return { documentSelected: doc, documentSelectedIndex: index }
        }
      })
    }
    return { documentSelected: documentsReview[0], documentSelectedIndex: 0 }
  }

  constructor(props: IProps) {
    super(props)
    const { documentSelected, documentSelectedIndex } = ReviewDocumentsFeedback.getDefaultSelectedDocument(
      props.documentsReview,
      props.location
    )
    this.state = {
      numberOfDiscrepant: ReviewDocumentsFeedback.getNumberOfDiscrepantDocuments(props.documentsReview),
      documentSelected,
      documentSelectedIndex
    }
  }

  setSelectedDocument = (document: IFullDocumentReviewResponse, index: number) => {
    this.setState({ documentSelected: document, documentSelectedIndex: index })
  }

  showNextDocument = () => {
    const { documentsReview } = this.props
    const { documentSelectedIndex } = this.state
    this.setSelectedDocument(documentsReview[documentSelectedIndex + 1], documentSelectedIndex + 1)
    this.props.fetchDocumentContent(
      documentsReview[documentSelectedIndex + 1].document.id,
      documentsReview[documentSelectedIndex + 1].document.product.id
    )
  }

  showPreviousDocument = () => {
    const { documentsReview } = this.props
    const { documentSelectedIndex } = this.state
    this.setSelectedDocument(documentsReview[documentSelectedIndex - 1], documentSelectedIndex - 1)
    this.props.fetchDocumentContent(
      documentsReview[documentSelectedIndex - 1].document.id,
      documentsReview[documentSelectedIndex - 1].document.product.id
    )
  }
  render() {
    const { documentsReview, history, isLCPresentationContext } = this.props
    const { numberOfDiscrepant, documentSelected, documentSelectedIndex } = this.state
    return (
      <React.Fragment>
        <Grid>
          <Grid.Row>
            <Grid.Column width={4}>
              <ReviewFeedbackDocumentCounter total={documentsReview.length} numberOfDiscrepant={numberOfDiscrepant} />
            </Grid.Column>
            <Grid.Column width={12}>
              <Button floated="right" onClick={history.goBack}>
                Close
              </Button>
            </Grid.Column>
          </Grid.Row>

          <Grid.Row>
            <Grid.Column width={11}>
              <DocumentContentView
                documentContent={this.props.documentRaw}
                documentType={this.props.documentType}
                isLoadingContent={this.props.isLoadingContent}
              />
            </Grid.Column>
            <Grid.Column width={5}>
              {documentSelected && (
                <EvaluationNavigatePanel
                  backward={this.showPreviousDocument}
                  forward={this.showNextDocument}
                  name={documentSelected.document.name}
                  index={documentSelectedIndex}
                  total={documentsReview.length}
                />
              )}
              <Divider />
              {documentSelected && (
                <EvaluationInfoTable
                  type={documentSelected.document.type.name}
                  title={documentSelected.document.name}
                  expiry={documentSelected.document.registrationDate}
                  metadata={documentSelected.document.metadata.map(x => x.value)}
                  reviewStatus={
                    isLCPresentationContext
                      ? mapDocReviewStatusesToPresentationDocStatues[documentSelected.status]
                      : documentSelected.status
                  }
                  reviewStatusLabelColor={documentSelected.status === IDocumentReviewStatus.REJECTED ? 'red' : 'green'}
                  reviewComment={documentSelected.note}
                  parcelId={documentSelected.document.context ? documentSelected.document.context.parcelId : undefined}
                  comment={documentSelected.document.comment}
                />
              )}
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </React.Fragment>
    )
  }
}

export default ReviewDocumentsFeedback
