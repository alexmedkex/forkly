import * as React from 'react'
import { Redirect, RouteComponentProps } from 'react-router-dom'
import { compose } from 'redux'
import { Button, Progress, Divider, Grid } from 'semantic-ui-react'
import { Readable } from 'stream'
import styled from 'styled-components'

import FullpageModal from '../../../../components/fullpage-modal'
import withDocument from '../../../document-management/hoc/withDocument'
import withDocumentsReview from '../../hoc/withDocumentsReview'
import { IFullDocumentReviewResponse, ReviewStatus } from '../../store/types'
import EvaluationInfoPanel from './EvaluationInfoPanel'
import ReviewDocumentsCounter from '../ReviewDocumentsCounter'
import NavigatePanel from './NavigatePanel'
import DocumentContentView from '../../../document-management/components/documents/DocumentContentView'

interface Props extends RouteComponentProps<any> {
  location: {
    pathname: string
    search: string
    state: {
      documents: IFullDocumentReviewResponse[]
      documentId: string
      sendDocumentsRequestId: string
      redirectBackUrl?: string
    }
    hash: string
  }
  documentRaw: string
  documentType: string
  isLoadingContent: boolean
  fetchDocumentContentAsync(idDoc: string, productId: string, isLcDocument: boolean): void
  patchDocumentsReviewAsync(idRequest: string, documentsReviewed: IFullDocumentReviewResponse[]): void
  onClose?(): void
}

const StyledGridRow = styled(Grid.Row)`
  &&& {
    margin-bottom: 15px;
  }
`

interface State {
  documentSelected: IFullDocumentReviewResponse
  documentSelectedIndex: number
  redirect: boolean
}

class EvaluationContainer extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    let documentSelected
    if (this.props.location.state && this.props.location.state.documents) {
      documentSelected = this.props.location.state.documents.find(
        doc => doc.document.id === this.props.location.state.documentId
      )
    }
    this.state = {
      documentSelected,
      redirect: false,
      documentSelectedIndex: 0
    }
    this.showPreviousDocument = this.showPreviousDocument.bind(this)
    this.showNextDocument = this.showNextDocument.bind(this)
    this.onReviewDocument = this.onReviewDocument.bind(this)
    this.onCommentRejectedDocument = this.onCommentRejectedDocument.bind(this)
  }

  componentDidMount(): void {
    if (this.props.location.state) {
      this.props.fetchDocumentContentAsync(
        this.props.location.state.documentId,
        this.state.documentSelected.document.product.id,
        this.props.location.state.redirectBackUrl ? true : false
      )
    }
  }

  showNextDocument() {
    const { documentSelectedIndex } = this.state
    const selectedDoc = this.props.location.state.documents[documentSelectedIndex + 1]
    this.setState({ documentSelected: selectedDoc, documentSelectedIndex: documentSelectedIndex + 1 })
    this.props.fetchDocumentContentAsync(
      selectedDoc.document.id,
      selectedDoc.document.product.id,
      this.props.location.state.redirectBackUrl ? true : false
    )
  }

  showPreviousDocument() {
    const { documentSelectedIndex } = this.state
    const selectedDoc = this.props.location.state.documents[documentSelectedIndex - 1]
    this.setState({ documentSelected: selectedDoc, documentSelectedIndex: documentSelectedIndex - 1 })
    this.props.fetchDocumentContentAsync(
      selectedDoc.document.id,
      selectedDoc.document.product.id,
      this.props.location.state.redirectBackUrl ? true : false
    )
  }

  onReviewDocument(option: string) {
    const selectedDoc = this.state.documentSelected
    selectedDoc.status = option
    this.setState({ documentSelected: selectedDoc })
  }

  onCommentRejectedDocument(comment: string) {
    const selectedDoc = this.state.documentSelected
    selectedDoc.note = comment
    this.setState({ documentSelected: selectedDoc })
  }

  streamToBuffer(stream: Readable): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const buffers: Buffer[] = []
      stream.on('error', reject)
      stream.on('data', data => buffers.push(data))
      stream.on('end', () => resolve(Buffer.concat(buffers)))
    })
  }

  renderRedirect = () => {
    if (this.state.redirect) {
      return (
        <Redirect
          to={{
            pathname: '/review',
            state: {
              requestId: this.props.location.state.sendDocumentsRequestId,
              redirectBackUrl: this.props.location.state.redirectBackUrl
            }
          }}
        />
      )
    }
    return undefined
  }

  setRedirect = () => {
    const isTradeFinance = !!this.props.location.state.redirectBackUrl

    this.callActionSync(
      this.props.patchDocumentsReviewAsync,
      this.props.location.state.sendDocumentsRequestId,
      this.props.location.state.documents,
      isTradeFinance ? 'tradeFinance' : 'kyc'
    ).then(() => (isTradeFinance ? this.setStateSync({ redirect: true }) : this.props.history.goBack()))
  }

  async callActionSync(
    action: (sendDocsReqId: string, args: any, productId: string) => void,
    sendDocsReqId: string,
    args: any,
    productId: string
  ) {
    return action(sendDocsReqId, args, productId)
  }

  async setStateSync(newState: any) {
    this.setState(newState)
  }

  render() {
    if (!this.state.documentSelected) {
      return <NoDocumentSelected>There is no document selected</NoDocumentSelected>
    }
    return !this.props.location.state.redirectBackUrl ? (
      <FullpageModal
        header={() => (
          <div className="evaluation-fullscreen-header">
            {this.renderCounter()}
            {this.renderCloseButton()}
          </div>
        )}
        content={() => <div className="evaluation-fullscreen-content">{this.renderDocument()}</div>}
        left={() => this.renderRightPanel()}
        open={!this.state.redirect}
        onClose={() => this.setRedirect()}
      />
    ) : (
      <React.Fragment>
        <Grid>
          <StyledGridRow>
            <Grid.Column width={4}>{this.renderCounter()}</Grid.Column>
            <Grid.Column width={12}>{this.renderCloseButton()}</Grid.Column>
          </StyledGridRow>
          <Grid.Row>
            <Grid.Column width={11}>{this.renderDocument()}</Grid.Column>
            <Grid.Column width={5}>{this.renderRightPanel()}</Grid.Column>
          </Grid.Row>
        </Grid>
      </React.Fragment>
    )
  }

  private renderCloseButton = () => {
    return (
      <>
        {this.renderRedirect()}
        <Button floated="right" onClick={() => (this.props.onClose ? this.props.onClose() : this.setRedirect())}>
          Close
        </Button>
      </>
    )
  }
  private renderCounter = () => {
    return (
      <div>
        <ReviewDocumentsCounter
          numTotalDocs={this.props.location.state.documents.length}
          numDocsReviewed={
            this.props.location.state.documents.filter(doc => doc.status !== ReviewStatus.PENDING).length
          }
        />
        <Progress
          className="review-progress"
          value={this.props.location.state.documents.filter(doc => doc.status !== ReviewStatus.PENDING).length}
          total={this.props.location.state.documents.length}
        />
      </div>
    )
  }

  private renderDocument = () => {
    return (
      <DocumentContentView
        documentContent={this.props.documentRaw}
        documentType={this.props.documentType}
        isLoadingContent={this.props.isLoadingContent}
      />
    )
  }

  private renderRightPanel = () => {
    const { documentSelected } = this.state
    return (
      <>
        <NavigatePanel
          backward={this.showPreviousDocument}
          forward={this.showNextDocument}
          name={this.state.documentSelected.document.name}
          total={this.props.location.state.documents.length}
          index={this.state.documentSelectedIndex}
        />
        <Divider />
        <EvaluationInfoPanel
          type={documentSelected.document.type.name}
          title={documentSelected.document.name}
          expiry={documentSelected.document.receivedDate}
          metadata={documentSelected.document.metadata.map(x => x.value)}
          reviewStatus={documentSelected.status}
          reviewComment={documentSelected.note}
          onReviewDocument={this.onReviewDocument}
          onCommentRejectedDocument={this.onCommentRejectedDocument}
          comment={documentSelected.document.comment}
          parcelId={documentSelected.document.context ? documentSelected.document.context.parcelId : undefined}
        />
      </>
    )
  }

  private renderFullscreenContent = () => {
    return (
      <Grid divided={false}>
        <ScrollableGridColumn width={10} style={{ backgroundColor: '#f2f5f8', padding: '30px' }}>
          {this.renderDocument()}
        </ScrollableGridColumn>
        <Grid.Column width={6} style={{ padding: '30px' }}>
          {this.renderRightPanel()}
        </Grid.Column>
      </Grid>
    )
  }
}

const ScrollableGridColumn = styled(Grid.Column)`
  display: flex !important;
  flex-direction: column;
  align-items: center;
  height: 100vh;
  overflow-y: auto;
`

const NoDocumentSelected = styled.div`
  text-align: center;
  margin-top: 15%;
`

export default compose(withDocument, withDocumentsReview)(EvaluationContainer)
