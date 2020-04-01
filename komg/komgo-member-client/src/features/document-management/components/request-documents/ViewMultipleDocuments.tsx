import * as React from 'react'
import { Divider, Button, Confirm } from 'semantic-ui-react'

import DocumentViewContainer, { HeaderActions } from '../../containers/DocumentViewContainer'
import DocumentSimpleHeader from '../documents/DocumentSimpleHeader'
import { Document } from '../../store'
import NavigatePanel from '../../../review-documents/containers/evaluation/NavigatePanel'
import EvaluationInfoTable from '../../../review-documents/containers/evaluation/EvaluationInfoTable'
import { truncate } from '../../../../utils/casings'

interface IProps {
  documentIds: string[]
  delete(id: string): void
  closeModal(): void
}

interface IState {
  activeIndex: number
  deleteDocument?: Document
}

class ViewMultipleDocuments extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props)
    this.state = {
      activeIndex: 0
    }

    this.showPreviousDocument = this.showPreviousDocument.bind(this)
    this.showNextDocument = this.showNextDocument.bind(this)
    this.handleConfirmDeleteDocument = this.handleConfirmDeleteDocument.bind(this)
    this.handleCancelDeleteDocument = this.handleCancelDeleteDocument.bind(this)
  }

  showPreviousDocument() {
    this.setState({
      activeIndex: this.state.activeIndex - 1
    })
  }

  showNextDocument() {
    this.setState({
      activeIndex: this.state.activeIndex + 1
    })
  }

  handleDeleteDocument(document: Document) {
    this.setState({
      deleteDocument: document
    })
  }

  handleConfirmDeleteDocument() {
    const { deleteDocument, activeIndex } = this.state
    const { documentIds } = this.props
    this.props.delete(deleteDocument.id)
    const newActiveIndex = activeIndex + 1 === documentIds.length ? 0 : activeIndex
    this.setState({
      deleteDocument: undefined,
      activeIndex: newActiveIndex
    })
  }

  handleCancelDeleteDocument() {
    this.setState({
      deleteDocument: undefined
    })
  }

  renderRightSidebar(document: Document): React.ReactElement {
    const charactersToTruncate = 48
    return (
      <React.Fragment>
        <NavigatePanel
          backward={this.showPreviousDocument}
          forward={this.showNextDocument}
          name={truncate(document.name, charactersToTruncate)}
          index={this.state.activeIndex}
          total={this.props.documentIds.length}
          counter={true}
        />
        <Divider />
        <EvaluationInfoTable type={document.type.name} title={document.name} expiry={document.registrationDate} />
        <Button
          style={{ width: '50%' }}
          onClick={() => this.handleDeleteDocument(document)}
          data-test-id="delete-document-button"
        >
          Delete
        </Button>
      </React.Fragment>
    )
  }

  render() {
    const { documentIds, closeModal } = this.props
    const { activeIndex, deleteDocument } = this.state

    return (
      <div data-test-id="view-multiple-documents-modal">
        <DocumentViewContainer
          documentId={documentIds[activeIndex]}
          onClose={closeModal}
          renderHeader={(document: Document, actions: HeaderActions) => (
            <DocumentSimpleHeader document={document} actions={actions} />
          )}
          renderInfoSection={(document: Document) => this.renderRightSidebar(document)}
        />
        {deleteDocument && (
          <Confirm
            open={true}
            header="Delete attached document"
            content={`You are about to delete ${
              deleteDocument.name
            } from the selection. Are you sure you want to delete this document?`}
            onCancel={this.handleCancelDeleteDocument}
            onConfirm={this.handleConfirmDeleteDocument}
            cancelButton={<Button data-test-id="delete-document-modal-cancel">Cancel</Button>}
            confirmButton={
              <Button negative={true} data-test-id="delete-document-modal-confirm">
                Delete
              </Button>
            }
          />
        )}
      </div>
    )
  }
}

export default ViewMultipleDocuments
