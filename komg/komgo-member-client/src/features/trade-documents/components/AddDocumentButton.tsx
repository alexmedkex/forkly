import React, { Component } from 'react'

import { Document, Category, DocumentType, CreateDocumentRequest } from '../../document-management'
import AddNewDocumentModal from '../../document-management/components/documents/AddNewDocumentModal'
import AddNewDocumentForm from '../../document-management/components/documents/AddNewDocumentForm'

import { StyledAddDocumentButton } from './TradeDocumentsStyles'

interface State {
  visible: boolean
}

interface Props {
  documents: Document[]
  categories: Category[]
  documentTypes: DocumentType[]
  onSubmit(createDocumentRequest: CreateDocumentRequest): void
}

class AddDocumentButton extends Component<Props, State> {
  state = { visible: false }

  toggleAddDocumentModal = () => {
    this.setState(prev => ({ visible: !prev.visible }))
  }

  handleSubmit = (createDocumentRequest: CreateDocumentRequest) => {
    this.toggleAddDocumentModal()
    this.props.onSubmit(createDocumentRequest)
  }

  render() {
    return (
      <>
        <StyledAddDocumentButton onClick={this.toggleAddDocumentModal} primary={true}>
          Add document
        </StyledAddDocumentButton>
        <AddNewDocumentModal
          toggleVisible={this.toggleAddDocumentModal}
          visible={this.state.visible}
          title={'Add document'}
        >
          <AddNewDocumentForm
            documents={this.props.documents}
            categories={this.props.categories}
            documentTypes={this.props.documentTypes}
            handleSubmit={this.handleSubmit}
            preselectedCategory=""
            preselectedDocumentType=""
          />
        </AddNewDocumentModal>
      </>
    )
  }
}

export default AddDocumentButton
