import { LoadingTransition } from '../../../components'
import * as React from 'react'
import { withRouter, RouteComponentProps } from 'react-router-dom'
import { compose } from 'redux'
import { Grid } from 'semantic-ui-react'
import styled from 'styled-components'

import withCounterparites from '../../counterparties/hoc/withCounterparties'
import { Counterparty } from '../../counterparties/store/types'
import DocumentContentView from '../components/documents/DocumentContentView'
import DocumentViewHeader from '../components/documents/DocumentViewHeader'
import DocumentInfoView from '../components/documents/DocumentViewInfo'
import withDocument from '../hoc/withDocument'
import { Document, ProductId, ModalName, SharedWithFull } from '../store/types'
import ModalsContainer from './ModalsContainer'
import { withModalsState } from '../hoc'
import * as DocumentHelper from '../utils/documentHelper'
import { downloadSelectedDocuments } from '../utils/downloadDocument'
import { withDocuments } from '../hoc'
import { DEFAULT_PRODUCT } from '../store'
import FullpageModal from '../../../components/fullpage-modal'

const PRODUCT_ID_QUERY_PARAM = 'productId'

export interface HeaderActions {
  // Add another actions if needed
  close(): void
}

interface Props extends RouteComponentProps<any> {
  productId: ProductId
  loadedDocument: Document
  documentRaw: string
  documentType: string
  isLoadingContent: boolean
  counterparties: Counterparty[]
  documentId?: string
  onClose?(): void
  renderHeader?(document: Document, actions: HeaderActions): JSX.Element
  renderInfoSection?(document: Document): JSX.Element
  fetchDocumentAsync(productId: ProductId, documentId: string, isLcDocument: boolean): void
  fetchDocumentContentAsync(documentId: string, productId: ProductId, isLcDocument: boolean): void
  fetchConnectedCounterpartiesAsync(): void
  toggleModalVisible(modalName: ModalName): void
  downloadDocumentsAsync(documentId: string, productId: ProductId): void
  deleteDocumentAsync(productId: ProductId, documentId: string): void
}

interface State {
  open: boolean
}

class DocumentViewContainer extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      open: true
    }
  }

  componentDidUpdate(prevProps: Props) {
    // When component is printed as modal, we don't have to destroy component if product id has changed
    const { documentId } = this.props
    if (documentId && prevProps.documentId !== documentId) {
      this.fetchDocument()
    }
  }

  documentId(): string {
    return this.props.documentId || this.props.match.params.id
  }

  // TODO: refactor this URL logic and extract to out side. configuration for container should be injected
  isLcDocument(): boolean {
    return this.props.match.path === '/financial-instruments/letters-of-credit/:letterOfCreditId/documents/:id'
  }

  productId(): string {
    if (this.isLcDocument()) {
      return 'tradeFinance'
    }
    const queryParams = new URLSearchParams(this.props.location.search)
    if (queryParams.has(PRODUCT_ID_QUERY_PARAM)) {
      return queryParams.get(PRODUCT_ID_QUERY_PARAM)
    } else {
      return DEFAULT_PRODUCT
    }
  }

  componentDidMount(): void {
    this.props.fetchConnectedCounterpartiesAsync()
    this.fetchDocument()
  }

  fetchDocument() {
    this.props.fetchDocumentAsync(this.productId() as ProductId, this.documentId(), this.isLcDocument())
    this.props.fetchDocumentContentAsync(this.documentId(), this.productId() as ProductId, this.isLcDocument())
  }

  render() {
    if (!this.props.loadedDocument) {
      return this.displayLoading()
    }

    return this.displayDocumentView()
  }

  private displayLoading() {
    return (
      <FullpageModal open={this.state.open} header={() => null}>
        <LoadingTransition />
      </FullpageModal>
    )
  }

  private displayDocumentView() {
    const sharedBy = this.sharedByCounterparty()
    const sharedWith = this.sharedWithCounterparties()

    return (
      <FullpageModal
        open={this.state.open}
        header={() => this.renderHeader(sharedBy)}
        content={() => this.renderContent()}
        left={() => this.renderInfoView(sharedWith)}
      />
    )
  }

  private renderHeader = (sharedBy: Counterparty) => {
    if (this.props.renderHeader) {
      return this.props.renderHeader(this.props.loadedDocument, { close: this.closeModal })
    }
    return (
      <DocumentViewHeader
        goBack={this.closeModal}
        loadedDocument={this.props.loadedDocument}
        onDownloadDocument={() => {
          downloadSelectedDocuments(this.props.downloadDocumentsAsync)([this.props.loadedDocument])
        }}
        onShareDocument={() => this.props.toggleModalVisible('shareDocument')}
        sharedByCounterparty={sharedBy}
        onDeleteDocument={() => this.props.toggleModalVisible('deleteDocument')}
      />
    )
  }

  private renderContent = () => {
    return (
      <>
        <ModalsContainer />
        {this.renderDocument()}
      </>
    )
  }

  private renderDocument = () => {
    return (
      <DocumentContentView
        isLoadingContent={this.props.isLoadingContent}
        documentContent={this.props.documentRaw}
        documentType={this.props.documentType}
      />
    )
  }

  private renderInfoView = (sharedWith: SharedWithFull[]) => {
    if (this.props.renderInfoSection) {
      return this.props.renderInfoSection(this.props.loadedDocument)
    }
    return (
      <DocumentInfoView
        loadedDocument={this.props.loadedDocument}
        sharedWith={sharedWith}
        isSharedDocument={DocumentHelper.isSharedDocument(this.props.loadedDocument)}
      />
    )
  }

  private closeModal = () => {
    const { onClose } = this.props
    this.setState({ open: false }, () => {
      if (onClose) {
        this.props.onClose()
      } else {
        this.props.history.goBack()
      }
    })
  }

  private dateSortDesc = (date1: Date, date2: Date) => {
    if (date1 > date2) {
      return -1
    }
    if (date1 < date2) {
      return 1
    }
    return 0
  }

  private sharedWithCounterparties = (): SharedWithFull[] => {
    return this.props.loadedDocument.sharedWith.map(shared => {
      return {
        counterparty: this.props.counterparties.find(c => c.staticId === shared.counterpartyId),
        lastSharedDate: shared.sharedDates ? shared.sharedDates.sort(this.dateSortDesc)[0] : null
      }
    })
  }

  private sharedByCounterparty = (): Counterparty | undefined => {
    const counterparty = this.props.counterparties.find(counterparty => {
      return counterparty.staticId === this.props.loadedDocument.sharedBy
    })
    if (!counterparty) {
      console.debug(`Couldn't find a counterparty with static id ${this.props.loadedDocument.sharedBy}`)
    }
    return counterparty
  }
}

export default compose<any>(withCounterparites, withDocument, withDocuments, withModalsState, withRouter)(
  DocumentViewContainer
)
