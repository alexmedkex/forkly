import * as React from 'react'
import { Dropdown } from 'semantic-ui-react'

interface Props {
  userCanCreateRequest: boolean
  toggleNewDocumentRequestModal(): void
  toggleLoadDocumentRequestTemplateModal(): void
}

export const NewRequestButtonGroup = (props: Props) => {
  if (props.userCanCreateRequest) {
    return (
      <Dropdown
        text="Document request &nbsp;"
        className="ui button primary"
        button={true}
        direction="left"
        options={getNewRequestOptions(props)}
      />
    )
  } else {
    return null
  }
}

export const getNewRequestOptions = (props: Props) => {
  const newRequest = {
    key: '1',
    text: '',
    value: 'Create new',
    content: 'Create new',
    onClick: props.toggleNewDocumentRequestModal
  }
  const loadTemplate = {
    key: '2',
    text: '',
    value: 'Load template',
    content: 'Load template',
    disabled: true /* TODO Load Template option disabled, should be re-enabled post MVP
    onClick: props.toggleLoadDocumentRequestTemplateModal */
  }

  return [
    newRequest
    // loadTemplate
  ]
}
