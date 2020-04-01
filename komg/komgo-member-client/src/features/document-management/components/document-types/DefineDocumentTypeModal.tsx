import * as React from 'react'
import { Form, Modal, Button, Input, Dropdown } from 'semantic-ui-react'
import { Category } from '../../store/types'

export interface Props {
  visible: boolean
  title: string
  categories: Category[]
  predefinedData: { category: string; name: string; id?: string }
  toggleVisible(): void
  onCreateSuccess(cat: string, name: string): void
  onEditSuccess(cat: string, name: string, id: string): void
}

interface State {
  category: string
  name: string
}

interface CategoryRepresentation {
  key: string
}

const formatCategoriesToSelect = (categories: Category[]): CategoryRepresentation[] => {
  return categories.map((cat: Category) => {
    return { key: cat.id, text: cat.name, value: cat.id }
  })
}

class DefineDocumentTypeModal extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
  }

  handleSubmit = () => {
    if (this.props.predefinedData.id) {
      this.props.onEditSuccess(
        this.state.category ? this.state.category : this.props.predefinedData.category,
        this.state.name,
        this.props.predefinedData.id
      )
    } else {
      this.props.onCreateSuccess(this.state.category, this.state.name)
    }
  }

  render() {
    return (
      <Modal open={this.props.visible} size="mini">
        <Modal.Header>{this.props.title}</Modal.Header>
        <Modal.Content>
          <Modal.Description>
            <Form onSubmit={this.handleSubmit} id="submit-form">
              <Form.Field>
                <label>Category</label>
                <Dropdown
                  placeholder="Select category"
                  defaultValue={
                    this.props.predefinedData.category !== '' ? this.props.predefinedData.category : undefined
                  }
                  options={formatCategoriesToSelect(this.props.categories)}
                  onChange={this.setSelectedCategoryId}
                />
              </Form.Field>
              <Form.Field>
                <label>Name</label>
                <Input
                  placeholder="My new doctype"
                  defaultValue={this.props.predefinedData.name !== '' ? this.props.predefinedData.name : undefined}
                  onChange={(e: any) => {
                    this.setState({ name: e.target.value })
                  }}
                  size="mini"
                />
              </Form.Field>
            </Form>
          </Modal.Description>
        </Modal.Content>
        <Modal.Actions>
          <Button className="ui negative button" role="button" onClick={this.props.toggleVisible}>
            Cancel
          </Button>
          <Button primary={true} content="Submit" form="submit-form" />
        </Modal.Actions>
      </Modal>
    )
  }

  private setSelectedCategoryId = (e: any, { value }: { value: string }) => {
    this.setState({ category: value })
  }
}

export default DefineDocumentTypeModal
