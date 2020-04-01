import * as React from 'react'
import { Confirm } from 'semantic-ui-react'

interface Props {
  open: boolean
  content: string
  onConfirmClose(): void
  onToggleVisible(): void
}

class CloseRequestDocuments extends React.Component<Props> {
  handleConfirm = () => {
    this.props.onConfirmClose()
  }

  renderContent = (content: string) => {
    return { content }
  }

  render() {
    const { onToggleVisible, open, content } = this.props
    return (
      <Confirm
        open={open}
        cancelButton="Cancel"
        confirmButton="Confirm"
        header="Close request"
        content={this.renderContent(content)}
        onCancel={() => onToggleVisible()}
        onConfirm={() => this.handleConfirm()}
      />
    )
  }
}

export default CloseRequestDocuments
