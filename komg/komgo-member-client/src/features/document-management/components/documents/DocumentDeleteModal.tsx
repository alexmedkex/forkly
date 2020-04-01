import * as React from 'react'
import { Confirm } from 'semantic-ui-react'
import { Document } from '../../store'

interface Props {
  open: boolean
  userId: string
  document: Document | undefined
  onConfirmDelete(): void
  onToggleVisible(): void
}

class DocumentDeleteModal extends React.Component<Props> {
  handleConfirm = () => {
    const { onConfirmDelete, onToggleVisible } = this.props
    onConfirmDelete()
    onToggleVisible()
  }

  renderContent = () => {
    const { document } = this.props
    return `Are you sure you want to delete ${document ? document.name : ''}. This action can not be undone`
  }

  render() {
    const { onToggleVisible, open } = this.props
    return (
      <Confirm
        open={open}
        cancelButton="Cancel"
        header="Delete document"
        content={this.renderContent()}
        onCancel={() => onToggleVisible()}
        onConfirm={() => this.handleConfirm()}
      />
    )
  }
}

export default DocumentDeleteModal
