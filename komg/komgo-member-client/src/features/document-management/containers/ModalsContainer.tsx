import * as React from 'react'
import { compose } from 'redux'

import { withCategories, withDocument, withDocuments, withDocumentTypes, withModalsState } from '../hoc'
import { withCounterparties } from '../../counterparties/hoc/index'

import DefineDocumentTypeModal from '../components/document-types/DefineDocumentTypeModal'
import AddNewDocumentModal from '../components/documents/AddNewDocumentModal'

import AddNewDocumentForm from '../components/documents/AddNewDocumentForm'

import DocumentShareModal from '../components/documents/share-modal/DocumentShareModal'
import DocumentDeleteModal from '../components/documents/DocumentDeleteModal'

import {
  Category,
  CreateDocumentRequest,
  DEFAULT_PRODUCT,
  Document,
  DocumentModals,
  DocumentType,
  DocumentTypeCreateRequest,
  DocumentTypeUpdateRequest,
  ModalName,
  ProductId,
  SendDocumentsRequest
} from '../store'
import { Counterparty } from '../../counterparties/store/types'
import { ApplicationState } from '../../../store/reducers'
import { connect } from 'react-redux'
import { BottomSheetItem, BottomSheetStatus } from '../../bottom-sheet/store/types'

interface Props {
  titleModalEditCreateDocType: string
  selectedModalCategories: Category[]
  selectedModalDocumentTypes: DocumentType[]
  selectedDocuments: string[]
  predefinedData: { category: string; name: string; id: string }
  categories: Category[]
  documentTypes: DocumentType[]
  loadedDocument: Document
  allDocs: Document[]
  allVisibleDocuments: Document[]
  counterparties: Counterparty[]
  modals: DocumentModals
  downloadDocumentWithLinkAsync: (documentId: string, productId: ProductId) => void

  createDocumentLinkAsync: (document: Document, isPersonalized: boolean) => void
  revokeExtSharedDoc: (document: Document, verificationLink) => void
  userId?: string
  items: BottomSheetItem[]

  toggleModalVisible(modalName: ModalName): void

  setModalStep(modalName: ModalName, step: number): void

  sendDocumentsAsync(request: SendDocumentsRequest[], productId: ProductId): void

  createDocumentAsync(createDocumentRequest: CreateDocumentRequest, productId: ProductId): void

  fetchDocumentsAsync(productId: ProductId, sharedBy?: string): void

  createDocumentTypeAsync(documentType: DocumentTypeCreateRequest, productId: ProductId): void

  updateDocumentTypeAsync(documentType: DocumentTypeUpdateRequest, productId: ProductId): void

  deleteDocumentAsync(productId: ProductId, documentId: string): void
}

export class ModalsContainer extends React.Component<Props> {
  constructor(props) {
    super(props)
  }

  isLinkDisabled = link => {
    return !!this.props.items.find(({ id, state }) => id === link && state === BottomSheetStatus.PENDING)
  }

  render() {
    const selectedDocumentIds = new Set(this.props.selectedDocuments || [])
    const { allVisibleDocuments = [] } = this.props
    const selectedDocuments = allVisibleDocuments.filter(d => selectedDocumentIds.has(d.id))
    const singleDocument = selectedDocuments.length > 0 ? selectedDocuments[0] : undefined
    const documentToDelete = this.props.loadedDocument ? this.props.loadedDocument : singleDocument
    const documentsSelected = this.props.loadedDocument ? [this.props.loadedDocument] : selectedDocuments
    return (
      <>
        <DocumentShareModal
          open={this.props.modals.shareDocument.visible}
          counterparties={this.props.counterparties}
          documents={documentsSelected}
          toggleVisible={() => this.props.toggleModalVisible('shareDocument')}
          handleShareUpdate={this.handleShareDocuments}
        />

        <DefineDocumentTypeModal
          categories={this.props.categories}
          toggleVisible={() => this.props.toggleModalVisible('addDocumentType')}
          visible={this.props.modals.addDocumentType.visible}
          title={'New document type'}
          onCreateSuccess={this.handleCreateDocType}
          onEditSuccess={this.handleEditDocType}
          predefinedData={{ category: '', name: '', id: '' }}
        />

        <AddNewDocumentModal
          toggleVisible={() => this.props.toggleModalVisible('addDocument')}
          visible={this.props.modals.addDocument.visible}
          title={'Add document'}
        >
          <AddNewDocumentForm
            documents={this.props.allDocs}
            categories={this.props.categories}
            documentTypes={this.props.documentTypes}
            handleSubmit={this.handleCreateDocument}
            preselectedCategory=""
            preselectedDocumentType=""
          />
        </AddNewDocumentModal>

        <DocumentDeleteModal
          document={documentToDelete}
          userId={this.props.userId}
          onConfirmDelete={() => this.handleDeleteDocument(documentToDelete)}
          onToggleVisible={() => this.props.toggleModalVisible('deleteDocument')}
          open={this.props.modals.deleteDocument.visible}
        />
      </>
    )
  }

  private handleDeleteDocument = (document: Document | undefined) => {
    if (document) {
      this.props.deleteDocumentAsync(DEFAULT_PRODUCT, document.id)
    }
  }

  private handleShareDocuments = (documentsToUpdate: SendDocumentsRequest[]) => {
    this.props.sendDocumentsAsync(documentsToUpdate, DEFAULT_PRODUCT)
  }

  private handleCreateDocument = (createDocumentRequest: CreateDocumentRequest) => {
    this.createDocument(createDocumentRequest)
      .then(this.reloadDocumentState)
      .then(() => this.props.toggleModalVisible('addDocument'))
  }

  private createDocument = async (createDocumentRequest: CreateDocumentRequest) => {
    this.props.createDocumentAsync(createDocumentRequest, DEFAULT_PRODUCT)
  }

  private reloadDocumentState = async () => {
    this.props.fetchDocumentsAsync(DEFAULT_PRODUCT, 'none')
  }

  private handleCreateDocType = (docTypeCategoryId: string, docTypeName: string) => {
    const newDocType: DocumentTypeCreateRequest = {
      categoryId: docTypeCategoryId,
      name: docTypeName,
      fields: []
    }
    this.props.createDocumentTypeAsync(newDocType, DEFAULT_PRODUCT)
    this.props.toggleModalVisible('addDocumentType')
  }

  private handleEditDocType = (docTypeCat: string, docTypeName: string, docId: string) => {
    const newDocType: DocumentTypeUpdateRequest = {
      name: docTypeName,
      id: docId,
      categoryId: docTypeCat,
      fields: []
    }
    this.props.updateDocumentTypeAsync(newDocType, DEFAULT_PRODUCT)
    this.props.toggleModalVisible('editDocumentType')
  }
}

const mapStateToProps = (state: ApplicationState) => ({
  userId: state.get('uiState').get('profile').id,
  items: state.get('bottomSheet').get('items')
})

export default compose(
  withModalsState,
  withCategories,
  withDocument,
  withDocumentTypes,
  withDocuments,
  withCounterparties,
  connect(mapStateToProps)
)(ModalsContainer)
