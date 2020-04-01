import * as React from 'react'
import { Modal, Button } from 'semantic-ui-react'

interface Props {
  visible: boolean
  title: string
  children: any
  toggleVisible(): void
}

interface State {
  submitButtonDisabled: boolean
}

class AddNewDocumentModal extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { submitButtonDisabled: true }
    this.toggleSubmitButton = this.toggleSubmitButton.bind(this)
  }

  toggleSubmitButton(option: boolean) {
    if (!option !== this.state.submitButtonDisabled) {
      this.setState({ submitButtonDisabled: !option })
    }
  }

  render() {
    return (
      <Modal open={this.props.visible} centered={true} style={{ top: 'unset' }}>
        <Modal.Header>{this.props.title}</Modal.Header>
        <Modal.Content>
          {React.Children.map(this.props.children, child => {
            return React.cloneElement(child, {
              // This code injects the toggleSubmit handler into the this.props.children
              toggleSubmit: this.toggleSubmitButton
            })
          })}
        </Modal.Content>
        <Modal.Actions>
          <Button className="ui button" role="button" onClick={this.props.toggleVisible}>
            Cancel
          </Button>
          <Button disabled={this.state.submitButtonDisabled} primary={true} content="Add document" form="submit-form" />
        </Modal.Actions>
      </Modal>
    )
  }
}

export default AddNewDocumentModal
