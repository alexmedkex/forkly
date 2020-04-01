import * as React from 'react'
import { Dropdown } from 'semantic-ui-react'

interface Props {
  userCanCrudAndShareDocs: boolean
  onNewDocumentClick(): void
  onNewDocumentTypeClick(): void
}
export const AddDocumentButtonGroup = (props: Props) => {
  return (
    <Dropdown text="Add new &nbsp;" button={true} className="ui button primary" direction="left" icon="dropdown">
      <Dropdown.Menu>
        {/* <Dropdown.Item    
          key="1"
          text=""
          icon="copy outline"
          value="New Document Type"
          content="New Document Type"
          onClick={props.onNewDocumentTypeClick}
          disabled={true}
        /> */}
        <Dropdown.Item key="2" text="" value="New Document" content="New Document" onClick={props.onNewDocumentClick} />
      </Dropdown.Menu>
    </Dropdown>
  )
}
