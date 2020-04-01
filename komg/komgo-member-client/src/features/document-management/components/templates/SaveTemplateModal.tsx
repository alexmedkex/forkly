import * as React from 'react'
import { Template } from '../../store'
import { Input, Modal } from 'semantic-ui-react'
import ModalFooterButton from '../ModalFooterButtons'

interface Props {
  visible: boolean
  template: Template
  toggleVisible(): void
  onSave(name: string): void
}

interface State {
  templateName: string
}

class SaveTemplateModal extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      templateName: ''
    }
  }

  handleChange = (e: any) => {
    this.setState({ templateName: e.target.value })
  }

  handleSave = () => {
    this.props.onSave(this.state.templateName)
    this.props.toggleVisible()
  }

  render() {
    return (
      <Modal
        width={'50%'}
        open={this.props.visible}
        centered={true}
        onOk={this.props.toggleVisible}
        onCancel={this.props.toggleVisible}
      >
        <Modal.Header>Save as template</Modal.Header>
        <Modal.Content>
          <p>Template name</p>
          <Input placeholder={'...'} onChange={this.handleChange} />
          <ModalFooterButton
            key="btn-back"
            toStep={0}
            text={'Cancel'}
            type={'default'}
            onClick={this.props.toggleVisible}
          />,
          <ModalFooterButton key="btn-next" toStep={1} text={'Save'} type={'primary'} onClick={this.handleSave} />
        </Modal.Content>
      </Modal>
    )
  }
}

export default SaveTemplateModal
