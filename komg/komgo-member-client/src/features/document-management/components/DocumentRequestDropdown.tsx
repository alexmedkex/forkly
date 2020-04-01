import * as React from 'react'
import { Dropdown } from 'semantic-ui-react'

// Renders a Dropdown for launching the modals for adding a new document or new document type
interface Props {
  toggleNewDocumentRequestModal(): void
  toggleLoadTemplateModal(): void
}

class DocumentRequestDropdown extends React.Component<Props> {
  constructor(props: Props) {
    super(props)
  }

  render() {
    return (
      <Dropdown
        text="Document request &nbsp;"
        button={true}
        direction="left"
        options={[
          {
            key: '1',
            text: '',
            value: 'Create new',
            content: 'Create new',
            onClick: (event: React.MouseEvent, props: any) => {
              this.props.toggleNewDocumentRequestModal()
            }
          },
          {
            key: '2',
            text: '',
            value: 'Load template',
            content: 'Load template',
            disabled: true /* TODO Load Template option disabled, should be re-enabled post MVP
            onClick: (event: React.MouseEvent, props: any) => {
              this.props.toggleLoadTemplateModal()
            }*/
          }
        ]}
      />
    )
  }
}

export default DocumentRequestDropdown
