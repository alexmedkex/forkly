import * as React from 'react'
import { withRouter, RouteComponentProps } from 'react-router-dom'
import { compose } from 'redux'
import { Button, Grid } from 'semantic-ui-react'
import FullpageModal from '../../../components/fullpage-modal'
import RequestDocumentsHeader from '../components/documents/RequestDocumentsHeader'
import styled from 'styled-components'
import CloseRequestDocuments from '../components/documents/CloseRequestDocuments'
import { fetchCounterpartyName } from '../utils/counterpartyHelper'
import { Counterparty, CounterpartiesActionType } from '../../counterparties/store/types'
import { withCounterparties } from '../../counterparties/hoc'
import { withRequests, withDocument, withDocuments } from '../hoc'
import {
  ProductId,
  Request,
  Document,
  DocumentType,
  SendDocumentsRequest,
  CreateDocumentRequest,
  RequestActionType,
  Note
} from '../store'
import { ReviewDocumentsSectionCard } from '../components/request-documents/ReviewDocumentsSectionCard'
import SelectAutomatchModal from '../components/documents/document-library/SelectAutomatchModal'
import { AddNewDocumentModal } from '../components'
import AddNewDocumentForm from '../components/documents/AddNewDocumentForm'
import { TOAST_TYPE, displayToast } from '../../toasts/utils'
import { groupBy } from '../components/documents/my-documents/toMap'
import _ from 'lodash'
import DocumentViewContainer, { HeaderActions } from './DocumentViewContainer'
import DocumentSimpleHeader from '../components/documents/DocumentSimpleHeader'
import DocumentSimpleInfo from '../components/documents/DocumentSimpleInfo'
import RequestOverview, { RequestSide } from '../components/request-documents/RequestOverview'
import { getCompanyName } from '../../counterparties/utils/selectors'
import { withLoaders, WithLoaderProps } from '../../../components/with-loaders'
import { LoadingTransition, ErrorMessage } from '../../../components'
import { SPACES } from '@komgo/ui-components'
import { NotesSection } from '../components/request-documents/request-notes/NotesSection'
import { StyledSelectTypesAndNotesRow } from '../components/request-documents/StyledSelectTypesAndNotesRow'

const DEFAULT_PRODUCT_ID = 'kyc'

export interface Props {
  requestById: Request
  counterparties: Counterparty[]
  allDocs: Document[]
  fetchIncomingRequestbyIdAsync(productId: ProductId, requestId: string): Request
  fetchConnectedCounterpartiesAsync(): void
  fetchCategoriesAsync(productId: ProductId): void
  fetchDocumentsAsync(productId: ProductId, optionParams?: string): void
  sendDocumentsAsync(documentsToUpdate: SendDocumentsRequest[], productId: ProductId): void
  downloadDocumentsAsync(documentId: string, productId: string)
  createDocumentAsync(createDocumentRequest: CreateDocumentRequest, productId: ProductId): void
  resetLoadedDocument(): void
}

interface State {
  closeModalVisible: boolean
  autoMatchDocumentType: DocumentType
  addDocumentModalDocumentType: DocumentType

  attachedDocuments: Map<string, IAttachedDocument[]>

  pendingCreateDocRequests: CreateDocumentRequest[]
  downloadedRequestAttachmentForTypes: string[]
  previewDocumentId: string
  noteInput: Note | null
}

type DocumentSource = 'library' | 'upload'

export interface IAttachedDocument {
  source: DocumentSource
  documentId: string
  status?: string
}

interface IProps extends Props, RouteComponentProps<any>, WithLoaderProps {}

export class DocumentRequestContainer extends React.Component<IProps, State> {
  constructor(props: IProps) {
    super(props)
    this.state = {
      closeModalVisible: false,
      autoMatchDocumentType: null,
      addDocumentModalDocumentType: null,
      previewDocumentId: '',

      attachedDocuments: new Map(),
      pendingCreateDocRequests: [],

      downloadedRequestAttachmentForTypes: [],

      noteInput: null
    }
  }

  componentDidMount() {
    const incomingRequestId = this.props.match.params.id
    this.props.fetchIncomingRequestbyIdAsync(DEFAULT_PRODUCT_ID, incomingRequestId)
    this.props.fetchDocumentsAsync(DEFAULT_PRODUCT_ID)
    this.props.fetchConnectedCounterpartiesAsync()
  }

  componentDidUpdate(prevProps: Props) {
    const diff = _.differenceWith(this.props.allDocs, prevProps.allDocs, (first, second) => first.id === second.id)

    const { pendingCreateDocRequests } = this.state

    const processedRequests = []

    const getUploadedDocName = createDocumentRequest => {
      const [fileName, ext] = createDocumentRequest.file.name.split('.')

      return `${createDocumentRequest.name}.${ext}`
    }

    // when document is uploaded,it it added to the list of all docs
    // check if we have that request info locally, and add document for this request in list of attached documents
    if (diff.length && pendingCreateDocRequests && pendingCreateDocRequests.length) {
      pendingCreateDocRequests.forEach(req => {
        // it is posible to match save request and related document data only by name
        const matchedDoc = diff.find(doc => doc.name === getUploadedDocName(req) && doc.type.id === req.documentTypeId)

        if (matchedDoc) {
          this.appendDocuments(matchedDoc.type.id, [matchedDoc.id], 'upload')
          processedRequests.push(req)
        }
      })

      this.setState({
        pendingCreateDocRequests: pendingCreateDocRequests.filter(r => !processedRequests.includes(r))
      })
    }
  }

  render() {
    const { previewDocumentId } = this.state
    const { isFetching, errors } = this.props
    const [error] = errors

    if (isFetching) {
      return <LoadingTransition title="Loading request" />
    }

    if (error) {
      return <ErrorMessage title="Loading request" error={error} />
    }

    return (
      <>
        <FullpageModal open={true} header={() => this.renderHeader()}>
          {this.renderContent()}
        </FullpageModal>

        <CloseRequestDocuments
          content={
            'You are about to close the "Document request" workflow. ' +
            'Your changes will not be saved. Do you want to continue?'
          }
          onConfirmClose={() => this.handleCancelRequestDocuments()}
          onToggleVisible={() => this.toggleModalVisible()}
          open={this.state.closeModalVisible}
        />

        {this.props.requestById && this.renderAutomatchModal()}
        {this.props.requestById && this.renderAddNewDocumentModal()}

        {previewDocumentId !== '' && (
          <div data-test-id="view-document-modal">
            <DocumentViewContainer
              documentId={previewDocumentId}
              onClose={this.handleTogglePreviewDocument}
              renderHeader={(document: Document, actions: HeaderActions) => (
                <DocumentSimpleHeader document={document} actions={actions} />
              )}
              renderInfoSection={(document: Document) => <DocumentSimpleInfo document={document} />}
            />
          </div>
        )}
      </>
    )
  }

  handleTogglePreviewDocument = (previewDocumentId?: string) => {
    this.setState({
      previewDocumentId: previewDocumentId || ''
    })
    if (!previewDocumentId) {
      this.props.resetLoadedDocument()
    }
  }

  private renderHeader = () => {
    return (
      <RequestDocumentsHeader
        title={'Document request'}
        subtitlePrefix={'Received from'}
        counterpartyName={getCompanyName(this.getCounterparty())}
        onToggleCloseModal={() => {
          this.toggleModalVisible()
        }}
      />
    )
  }

  private renderContent = () => {
    return (
      <ViewContainer>
        <Body>{this.renderBody()}</Body>
        <Footer>
          <Button
            data-test-id="answer-request-button"
            primary={true}
            disabled={this.getAttachedDocumentsId().length === 0 ? true : false}
            content="Answer request"
            onClick={() => this.onSendDocuments()}
            style={{ justifySelf: 'flex-end' }}
          />
          {/* KOMGO-6887
          <Button
            data-test-id="save-and-close-button"
            content="Save & close"
            onClick={() => undefined} // TODO: implementation of the save & close button
            style={{ justifySelf: 'flex-end' }}
          /> */}
        </Footer>
      </ViewContainer>
    )
  }

  private renderBody = () => {
    return (
      <>
        <StyledSelectTypesAndNotesRow>
          <RequestOverview
            request={this.props.requestById}
            counterparty={this.getCounterparty()}
            requestSide={RequestSide.Receiver}
          />
          <NotesSection
            noteInput={this.state.noteInput}
            notes={[...this.props.requestById.notes]}
            setNoteContent={this.setNoteContent}
            getCounterpartyNameById={this.getCounterpartyNameById}
          />
        </StyledSelectTypesAndNotesRow>
        <ReviewDocumentsSectionCard
          onOriginalDocument={this.onNavigateToClick}
          onDocumentAttachmentDownload={this.handleDocumentAttachmentDownload}
          attachedDocuments={this.state.attachedDocuments}
          automatchSelectRequested={this.toggleAutomatchModalVisible}
          addNewDocumentRequested={this.toggleAddDocumentModalVisible}
          deleteDocRequested={docId => this.handleDeleteDocument(docId)}
          documentRequest={this.props.requestById}
          documentsByType={this.getDocumentsByTypes()}
          downloadedRequestAttachmentForTypes={this.state.downloadedRequestAttachmentForTypes}
          resetLoadedDocument={this.props.resetLoadedDocument}
          openViewDocument={this.handleTogglePreviewDocument}
        />
      </>
    )
  }

  private renderAutomatchModal = () => {
    const { autoMatchDocumentType, attachedDocuments } = this.state

    if (!autoMatchDocumentType) {
      return null
    }

    const selectedDocumentIds = attachedDocuments.has(autoMatchDocumentType.id)
      ? attachedDocuments
          .get(autoMatchDocumentType.id)
          .filter(d => d.source === 'library')
          .map(d => d.documentId)
      : []

    return (
      <SelectAutomatchModal
        onConfirmClose={(ids: string[]) => this.handleAutomatchDocumentsSelected(ids)}
        onToggleVisible={this.toggleAutomatchModalVisible}
        open={!!this.state.autoMatchDocumentType}
        allDocs={this.getDocumentsForAutomatchSelection()}
        category={autoMatchDocumentType.category}
        documentType={this.state.autoMatchDocumentType}
        allowMultipleSelection={true}
        selectedDocumentIds={selectedDocumentIds}
        openViewDocument={this.handleTogglePreviewDocument}
      />
    )
  }

  private renderAddNewDocumentModal = () => {
    const types = this.props.requestById.types
    const categories = types.map(type => type.category)

    return (
      <AddNewDocumentModal
        toggleVisible={() => this.toggleAddDocumentModalVisible(null)}
        visible={!!this.state.addDocumentModalDocumentType}
        title={'Add document'}
      >
        <AddNewDocumentForm
          documents={this.props.allDocs}
          categories={categories}
          documentTypes={types}
          handleSubmit={this.handleCreateDocument}
          preselectedCategory={
            this.state.addDocumentModalDocumentType ? this.state.addDocumentModalDocumentType.category.id : ''
          }
          preselectedDocumentType={
            this.state.addDocumentModalDocumentType ? this.state.addDocumentModalDocumentType.id : ''
          }
        />
      </AddNewDocumentModal>
    )
  }

  private getCounterparty(): Counterparty {
    const request = this.props.requestById
    if (!request) {
      return null
    }
    const counterpartyId = request.companyId
    const [counterparty] = this.props.counterparties.filter(counterparty => counterparty.staticId === counterpartyId)
    return counterparty
  }

  private getCounterpartyNameById = (counterpartyId: string) => {
    let counterpartyName = 'unknown'
    if (this.props.counterparties) {
      counterpartyName = fetchCounterpartyName(this.props.counterparties, counterpartyId)
    }
    return counterpartyName
  }

  private onNavigateToClick = (doc: Document) => {
    return this.props.history.push(`/documents/${doc.id}`)
  }

  private handleDocumentAttachmentDownload = (doc: Document) => {
    const { downloadedRequestAttachmentForTypes } = this.state
    this.setState({
      downloadedRequestAttachmentForTypes: [...downloadedRequestAttachmentForTypes, doc.type.id]
    })
  }

  private toggleModalVisible = () => {
    this.setState({ closeModalVisible: !this.state.closeModalVisible })
  }

  private onSendDocuments = () => {
    const request = this.props.requestById
    const documents = this.getAttachedDocumentsId()

    const notes = this.state.noteInput
      ? [...this.props.requestById.notes, this.state.noteInput]
      : this.props.requestById.notes
    // prepare and send documents
    const sendDocumentsRequest: SendDocumentsRequest = {
      documents,
      companyId: request.companyId,
      requestId: request.id,
      notes
    }
    this.props.sendDocumentsAsync([sendDocumentsRequest], request.product.id)

    // close modal
    this.handleCloseRequestDocuments()
  }

  private handleCancelRequestDocuments = () => {
    this.handleCloseRequestDocuments()
  }

  private handleCloseRequestDocuments = () => {
    this.setState({ closeModalVisible: false }, () => {
      this.props.history.goBack()
    })
  }

  private toggleAutomatchModalVisible = (documentType: DocumentType) => {
    this.setState({ autoMatchDocumentType: documentType })
  }

  private toggleAddDocumentModalVisible = (documentType: DocumentType) => {
    this.setState({ addDocumentModalDocumentType: documentType })
  }

  private handleAutomatchDocumentsSelected(selectedDocumentIds: string[]): void {
    const { autoMatchDocumentType } = this.state

    const attachedDocuments = this.appendDocuments(autoMatchDocumentType.id, selectedDocumentIds, 'library')
    this.setState({
      attachedDocuments,
      autoMatchDocumentType: null
    })
  }

  private appendDocuments = (documentType: string, selectedDocumentIds: string[], source: DocumentSource) => {
    const { attachedDocuments } = this.state

    let existingDocuments: IAttachedDocument[] = []

    if (attachedDocuments.has(documentType)) {
      existingDocuments = attachedDocuments.get(documentType)
    }

    let selectedDocuments =
      source === 'upload' ? existingDocuments : existingDocuments.filter(doc => doc.source !== source)

    selectedDocuments = selectedDocuments.concat(
      selectedDocumentIds.map<IAttachedDocument>(docId => ({
        source,
        documentId: docId,
        status: source === 'upload' ? 'PENDING' : null
      }))
    )

    if (!selectedDocuments.length) {
      attachedDocuments.delete(documentType)
    } else {
      attachedDocuments.set(documentType, selectedDocuments)
    }

    return attachedDocuments
  }

  private handleCreateDocument = (createDocumentRequest: CreateDocumentRequest) => {
    this.createDocument(createDocumentRequest)
      // .then(this.reloadDocumentState)
      .then(() => this.setPendingCreateRequest(createDocumentRequest))
      .then(() => this.toggleAddDocumentModalVisible(null))
  }

  private setPendingCreateRequest(createDocumentRequest: CreateDocumentRequest) {
    const { pendingCreateDocRequests } = this.state
    this.setState({
      pendingCreateDocRequests: [...pendingCreateDocRequests, createDocumentRequest]
    })
  }

  private handleDeleteDocument(documentId: string) {
    const { attachedDocuments } = this.state

    const newSelectedDocuments = new Map(
      Array.from(attachedDocuments.entries()).map(
        ([type, docs]) => [type, docs.filter(doc => doc.documentId !== documentId)] as [string, IAttachedDocument[]]
      )
    )

    this.setState({
      attachedDocuments: newSelectedDocuments
    })

    displayToast('1 document successfully deleted', TOAST_TYPE.Ok)
  }

  private createDocument = async (createDocumentRequest: CreateDocumentRequest) => {
    this.props.createDocumentAsync(createDocumentRequest, DEFAULT_PRODUCT_ID)
  }

  private getAllAttachedDocumentIds(docType?: DocumentType, source?: DocumentSource) {
    const { attachedDocuments } = this.state

    if (docType) {
      return attachedDocuments.has(docType.id)
        ? attachedDocuments
            .get(docType.id)
            .filter(doc => !source || doc.source === source)
            .map(doc => doc.documentId)
        : null
    }

    return Array.from(attachedDocuments.entries()).reduce(
      (memo, documentsPerType) => [
        ...memo,
        ...documentsPerType[1].filter(doc => !source || doc.source === source).map(d => d.documentId)
      ],
      []
    )
  }

  private getDocumentsForAutomatchSelection = () => {
    const uploadedDocumentsIds = this.getAllAttachedDocumentIds(null, 'upload')

    return this.props.allDocs.filter(
      doc => doc.sharedBy === 'none' && doc.state === 'REGISTERED' && !uploadedDocumentsIds.includes(doc.id)
    )
  }

  private getDocumentsByTypes = (): Map<string, Document[]> => {
    return groupBy(this.props.allDocs.filter(doc => doc.sharedBy === 'none'), doc => doc.type.id)
  }

  private getAttachedDocumentsId(): string[] {
    const groupedDocuments = Array.from(this.state.attachedDocuments.values())
    return _.flatMap(groupedDocuments).map(attachedDocument => attachedDocument.documentId)
  }

  private setNoteContent = (content: string): void => {
    this.setState({
      noteInput: this.contentToNote(content)
    })
  }

  private contentToNote = (content: string): Note | null => {
    return content
      ? {
          sender: '',
          content,
          date: new Date().toISOString()
        }
      : null
  }
}

const Footer = styled.div`
  // 'position: fixed' would make the bottom line always visible
  min-height: 20px;
  width: 100%;
  min-height: 64px;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  height: 50px;
  bottom: 0px;
  position: fixed;
  padding-right: 43px;
  background-color: white;
  flex-direction: row-reverse;
  box-shadow: 4px 4px 4px 4px rgba(192, 207, 222, 0.51);
`

const Body = styled.div`
  // 'min-height: 931px;' would be the minimum size once we place the content
  background-color: #f2f5f8;
  min-height: 500px;
  max-height: 1000px;
  width: 100%;
`

const ViewContainer = styled.div`
  margin-top: 2px;
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  flex-direction: column;
  height: calc(100vh - 65px);
  overflow: auto;
  background-color: #f2f5f8;
  .ui.card {
    margin-bottom: 0 !important;
    margin-top: ${SPACES.SMALL} !important;
  }
`

export default compose<any>(
  withLoaders({
    actions: [RequestActionType.FETCH_INCOMING_REQUEST_BY_ID_REQUEST]
  }),
  withDocument,
  withRouter,
  withDocuments,
  withRequests,
  withCounterparties
)(DocumentRequestContainer)
