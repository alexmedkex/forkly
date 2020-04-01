import * as React from 'react'
import { compose } from 'redux'
import { Modal, Button, Popup, Grid } from 'semantic-ui-react'
import { withRouter } from 'react-router-dom'
import { ErrorMessage, LoadingTransition } from '../../../components'
import { kyc } from '@komgo/permissions'

import { withPermissions, WithPermissionsProps } from '../../../components/with-permissions'
import { Request, DocumentType, Document, CreateDocumentRequest, SendDocumentsRequest, ProductId } from '../store/types'
import { withRequests, withDocuments, withDocumentTypes } from '../hoc'
import { withCounterparties } from '../../counterparties/hoc'
import { Counterparty } from '../../counterparties/store/types'
import AddNewDocumentModal from '../../document-management/components/documents/AddNewDocumentModal'
import DocumentsList from '../../document-management/components/documents/my-documents/DocumentsList'
import AddNewDocumentForm from '../components/documents/AddNewDocumentForm'
import { MapDocumentsToDocumentTypeId } from '../../document-management/components/documents/my-documents/toMap'
import {
  mapDocumentsByDocumentTypeId,
  filterMapRequestedDocTypes
} from '../../document-management/components/documents/my-documents/toMap'
import { WithLoaderProps, withLoaders } from '../../../components/with-loaders'
import { RequestActionType } from '../../../../src/features/document-management/store/types'
import { DocumentSent } from '../../../components/document/DocumentSent'
import { BottomSheetStatus } from '../../bottom-sheet/store/types'

export interface LocationState {
  state: {
    requestId: string
  }
}

const DEFAULT_PRODUCT_ID = 'kyc'
export interface Props extends WithLoaderProps {
  location: LocationState
  history: any
  requests: Request[]
  counterparties: Counterparty[]
  documentTypes: DocumentType[]
  allVisibleDocuments: Document[]
  allDocs: Document[]
  selectedDocuments: string[]
  documentsGroupByType: MapDocumentsToDocumentTypeId
  error: Error
  fetchingConnectedCounterparties: boolean
  fetchIncomingRequestAsync(productId: ProductId): void
  fetchDocumentTypesAsync(productId: ProductId, categoryId?: string): void
  fetchDocumentsAsync(productId: ProductId, sharedBy?: string): void
  createDocumentAsync(createDocRequest: CreateDocumentRequest, productId: ProductId): void
  sendDocumentsAsync(documentsToUpdate: SendDocumentsRequest[], productId: ProductId): void
  fetchConnectedCounterpartiesAsync(): void
  // From withDocuments
  selectDocument(documentId: string): void
  selectDocumentType(documentTypeId: string, sentDocuments: string[]): void
  resetDocumentsSelectData(): void
}

interface State {
  visible: boolean
  hasError: boolean
  createDocumentModalVisible: boolean
  preselectedCategory: string
  preselectedDocumentType: string
}

const HEADER_TITLE = 'New document request'
const HEADER_SUBTITLE = 'has requested you share the following documents'
const ADD_DOCUMENT = 'Add document'
const CANCEL = 'Cancel'
const SEND_DOCUMENTS = 'Send documents'

export class IncomingRequestContainer extends React.Component<Props & WithPermissionsProps, State> {
  constructor(props: Props & WithPermissionsProps) {
    super(props)
    this.state = {
      hasError: false,
      createDocumentModalVisible: false,
      visible: true,
      preselectedCategory: '',
      preselectedDocumentType: ''
    }
    this.props.resetDocumentsSelectData()
    this.calculateCountCheckedDocuments = this.calculateCountCheckedDocuments.bind(this)
    this.renderDocumentTypeExtraFunctionality = this.renderDocumentTypeExtraFunctionality.bind(this)
  }

  public componentDidMount() {
    this.fetchAllAsync()
  }

  componentDidUpdate(prevProps: Props) {
    const allVisibleDocs: Document[] = this.props.allVisibleDocuments
    const prevAllVisibleDocs: Document[] = prevProps.allVisibleDocuments
    const allVisibleDocsLength: number = allVisibleDocs.length
    const prevAllVisibleDocsLength: number = prevAllVisibleDocs.length

    if (allVisibleDocsLength === prevAllVisibleDocsLength + 1) {
      const newElements: Document[] = allVisibleDocs.filter(value => -1 === prevAllVisibleDocs.indexOf(value))

      for (const newElement of newElements) {
        if (this.props.selectedDocuments.indexOf(newElement.id) === -1) {
          this.props.selectDocument(newElement.id)
        }
      }
    }
  }

  handleSelectDocument = (document: Document): void => {
    this.props.selectDocument(document.id)
  }

  handleSelectDocumentType = (documentType: DocumentType): void => {
    const taskRequestId = this.getIncomingTaskRequestId()
    const incomingRequest = this.getIncomingRequest(taskRequestId)

    this.props.selectDocumentType(documentType.id, incomingRequest.sentDocuments)
  }

  isLoading() {
    return this.props.fetchingConnectedCounterparties || this.props.isFetching
  }

  render() {
    if (this.state.hasError) {
      return this.renderError('Failed to fetch')
    }
    return this.isLoading() ? <LoadingTransition title="Fetching request" /> : this.renderRequestModalOrError()
  }

  renderDocumentTypeExtraFunctionality(docType: DocumentType): React.ReactNode {
    const extraActionStyle: React.CSSProperties = { display: 'inline', float: 'right' }
    const count = this.calculateCountCheckedDocuments(docType)
    return (
      <div style={extraActionStyle}>
        {count !== '0/0' ? (
          <p>{'(' + count + ')'}</p>
        ) : (
          <a onClick={() => this.handleClickLink(docType.id, docType.category.id)}>Add document</a>
        )}
      </div>
    )
  }

  renderDocumentExtraFunctionality(doc: Document, sentToCounterparty: boolean): React.ReactNode {
    return sentToCounterparty ? <DocumentSent /> : ''
  }

  calculateCountCheckedDocuments(docType: DocumentType) {
    const allDocumentsByDocumentTypeId = mapDocumentsByDocumentTypeId(this.props.allVisibleDocuments)

    // if there are no document at all, return 0/0
    if (!allDocumentsByDocumentTypeId) {
      return '0/0'
    }

    // if there are no documents for current document type, return 0/0
    const totalDocsForThisDoctype = allDocumentsByDocumentTypeId.get(docType.id)
    if (!totalDocsForThisDoctype) {
      return '0/0'
    }

    // at this point, we have all documents for a current document type
    const totalDocumentCount = totalDocsForThisDoctype.length
    const documentCount = new Set()

    // 1) track selected documents that belong to current document type
    totalDocsForThisDoctype
      .filter(doc => this.props.selectedDocuments.indexOf(doc.id) !== -1)
      .forEach(doc => documentCount.add(doc.id))

    // 2) track sent documents that belong to current document type
    const taskRequestId = this.getIncomingTaskRequestId()
    const incomingRequest = this.getIncomingRequest(taskRequestId)
    totalDocsForThisDoctype
      .filter(doc => incomingRequest.sentDocuments.indexOf(doc.id) !== -1)
      .forEach(doc => documentCount.add(doc.id))

    return documentCount.size + '/' + totalDocumentCount
  }

  private handleClickLink = (idDocType: string, idCat: string) => {
    this.toggleCreateDocumentModal(idDocType, idCat)
  }

  private renderRequestModalOrError(): JSX.Element {
    const taskRequestId = this.getIncomingTaskRequestId()
    const incomingRequest = this.getIncomingRequest(taskRequestId)

    if (!incomingRequest) {
      if (this.props.error) {
        return this.renderError(this.props.error.message)
      } else if (!this.props.isFetching) {
        return this.renderError(`Failed to find request with id ${taskRequestId}`)
      } // There is no error, just incomingRequest is not asynchronously populated yet
      else {
        return null
      }
    }

    const { types } = incomingRequest

    const requestCounterparty = this.getRequestCounterparty(incomingRequest)

    if (!requestCounterparty) {
      if (this.props.error) {
        return this.renderError(this.props.error.message)
      } else if (!this.props.fetchingConnectedCounterparties) {
        return this.renderError(`Failed to find counterparty with id ${incomingRequest.companyId}`)
      } else {
        return null
      } // There is no error, just requestCounterparty is not asynchronously populated yet
    }

    const requestTypeIds = new Set(types.map(dt => dt.id))
    const categoriesWithDuplicates = incomingRequest.types.map(dt => dt.category)
    const uniqueCategories = categoriesWithDuplicates.filter((v, i) => categoriesWithDuplicates.indexOf(v) === i)
    const docTypes: DocumentType[] = this.props.documentTypes.filter(dt => requestTypeIds.has(dt.id))
    const taskId = this.getIncomingTaskRequestId()
    const req = this.getIncomingRequest(taskId)!
    const sentDocuments = req.sentDocuments || []

    return (
      <>
        <Modal size="large" open={this.state.visible} id="incoming-request-modal" style={{ top: 'unset' }}>
          {this.renderModalHeader(requestCounterparty)}
          <Modal.Content scrolling={true}>
            <DocumentsList
              borderless={true}
              documentTypes={req.types}
              selectedDocuments={this.props.selectedDocuments}
              sentDocuments={sentDocuments}
              handleSelectDocument={this.handleSelectDocument}
              handleSelectDocumentType={this.handleSelectDocumentType}
              documentsGroupByType={this.props.documentsGroupByType}
              renderDocumentExtraFunctionality={this.renderDocumentExtraFunctionality}
              renderDocumentTypeExtraFunctionality={this.renderDocumentTypeExtraFunctionality}
              documentAdditionalPropsToBeShown={[]}
              displayEmptyDocTypes={true}
            />
          </Modal.Content>
          {this.renderModalActions(docTypes.length)}
        </Modal>
        <AddNewDocumentModal
          title={'Add document'}
          visible={this.state.createDocumentModalVisible}
          toggleVisible={this.toggleCreateDocumentModal}
        >
          <AddNewDocumentForm
            documents={this.props.allDocs}
            categories={uniqueCategories}
            documentTypes={incomingRequest.types}
            handleSubmit={this.handleCreateDocument}
            preselectedCategory={this.state.preselectedCategory}
            preselectedDocumentType={this.state.preselectedDocumentType}
          />
        </AddNewDocumentModal>
      </>
    )
  }

  private getIncomingTaskRequestId(): string {
    return this.props.location.state.requestId || ''
  }

  private getIncomingRequest(incomingRequestId: string): Request | undefined {
    const { requests } = this.props
    const [incomingRequest] = requests.filter(req => req.id === incomingRequestId)
    return incomingRequest
  }

  private getRequestCounterparty(req: Request): Counterparty | undefined {
    const { counterparties } = this.props
    const [incomingRequestCounterparty] = counterparties.filter(cp => cp.staticId === req.companyId)
    return incomingRequestCounterparty
  }

  private renderModalHeader(cp: Counterparty) {
    return (
      <Modal.Header>
        <Grid>
          <Grid.Row>
            <Grid.Column floated="left" width={12}>
              <h3>{HEADER_TITLE}</h3>
              <h4>{this.getHeaderSubtitle(cp)}</h4>
            </Grid.Column>
            <Grid.Column floated="right" width={4}>
              <Button onClick={() => this.toggleCreateDocumentModal()} floated="right">
                {ADD_DOCUMENT}
              </Button>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Modal.Header>
    )
  }

  private toggleCreateDocumentModal = (idDocType: string = '', idCat: string = '') => {
    this.setState({ preselectedCategory: idCat })
    this.setState({ preselectedDocumentType: idDocType })
    this.setState({ createDocumentModalVisible: !this.state.createDocumentModalVisible })
  }

  private handleCreateDocument = (createDocumentRequest: CreateDocumentRequest) => {
    this.createDocument(createDocumentRequest)
      .then(this.reloadDocumentState)
      .then(this.toggleCreateDocumentModal.bind(this))
  }

  private createDocument = async (createDocumentRequest: CreateDocumentRequest) => {
    this.props.createDocumentAsync(createDocumentRequest, DEFAULT_PRODUCT_ID) // TODO: Request must inform productId
  }

  private reloadDocumentState = async () => {
    this.props.fetchDocumentsAsync(DEFAULT_PRODUCT_ID, 'none')
  }

  private renderModalActions = (numTypesRequested: number) => {
    return (
      <Modal.Actions>
        <Button onClick={() => this.onCancel()}>{CANCEL}</Button>
        <Button primary={true} onClick={() => this.onSendDocuments()} disabled={this.disableSend(numTypesRequested)}>
          {SEND_DOCUMENTS}
        </Button>
      </Modal.Actions>
    )
  }

  private onCancel = () => {
    this.props.resetDocumentsSelectData()
    this.setState({ visible: false }, this.props.history.push('/tasks'))
  }

  private onSendDocuments = () => {
    const taskId = this.getIncomingTaskRequestId()
    const req = this.getIncomingRequest(taskId)!
    const sendDocumentsRequest: SendDocumentsRequest = {
      documents: this.props.selectedDocuments,
      companyId: req.companyId,
      requestId: req.id
    }
    this.props.sendDocumentsAsync([sendDocumentsRequest], req.product.id)
    this.onCancel()
  }

  private disableSend(numTypesRequested: number): boolean {
    if (this.userHasReadOnlyPermissionOnRequest()) {
      return true
    }
    if (this.requestNotFulfilled(numTypesRequested)) {
      return true
    }
  }

  private userHasReadOnlyPermissionOnRequest = () => {
    // If the user has permission to read a documents request, but not full crudShare then the user has RO permission on manageDocRequest.
    return this.props.isAuthorized(kyc.canReadDocReq) && !this.props.isAuthorized(kyc.canCrudAndShareDocReq)
  }

  private requestNotFulfilled = (numTypesRequested: number) => {
    /* If the number of document types which at least have one document selected is different
    than the total number of document types requested, then we return true */
    const taskId = this.getIncomingTaskRequestId()
    const req = this.getIncomingRequest(taskId)!
    const requestedMapAllDocuments = filterMapRequestedDocTypes(this.props.documentsGroupByType, req.types)
    /* requestedMapAllDocuments is just the map of all the documents available filtered
    by the ones counterparty has requested us */
    const numDifferentDocTypesSelected = Array.from(requestedMapAllDocuments.values())
      .map(x => x.filter(y => -1 !== this.props.selectedDocuments.indexOf(y.id)))
      .filter(x => x.length > 0).length
    /* In case we want to check that, at least, one document of each document type requested is picked then
    we would need to use this condition: return numDifferentDocTypesSelected !== numTypesRequested */
    return numDifferentDocTypesSelected === 0
  }

  private renderError(errorMessage: string) {
    return <ErrorMessage title={'Error'} error={errorMessage} />
  }

  private async fetchAllAsync(): Promise<void> {
    this.props.fetchConnectedCounterpartiesAsync()
    this.props.fetchDocumentTypesAsync(DEFAULT_PRODUCT_ID)
    this.props.fetchDocumentsAsync(DEFAULT_PRODUCT_ID, 'none')
    this.props.fetchIncomingRequestAsync(DEFAULT_PRODUCT_ID)
  }

  private getHeaderSubtitle(cp: Counterparty) {
    return `${cp.x500Name.CN} ${HEADER_SUBTITLE}`
  }
}

export default compose<any>(
  withRouter,
  withPermissions,
  withRequests,
  withDocuments,
  withDocumentTypes,
  withCounterparties,
  withLoaders({
    actions: [RequestActionType.FETCH_INCOMING_REQ_REQUEST]
  })
)(IncomingRequestContainer)
