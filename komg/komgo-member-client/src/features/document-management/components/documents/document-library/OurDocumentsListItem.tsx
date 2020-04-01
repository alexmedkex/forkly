import * as React from 'react'
import styled from 'styled-components'
import { Checkbox, Button } from 'semantic-ui-react'

import { Document } from '../../../store'
import { DropdownOption } from '../my-documents/DocumentListDropdownOptions'

import { ListItemBorderLeft } from './ListItemBorderLeft'
import { Items } from './DocumentListItem'

export interface Props {
  document: Document
  viewDocumentOption: DropdownOption
  downloadDocumentOption: DropdownOption
  selected: boolean
  highlighted: boolean
  ItemRenderer: (props: Props) => JSX.Element
  renderEllipsisMenu(doc: Document): React.ReactNode
  handleDocumentSelect(doc: Document): void
  getUserNameFromDocumentUploaderId(idUser: string): string
}

export const OurDocumentsListItem = (props: Props) => {
  const doc = props.document
  const { ItemRenderer } = props
  return (
    <DocumentListRow id={doc.id} key={doc.id} data-test-id={doc.name}>
      <Checkbox
        data-test-id={`checkbox-${doc.name}`}
        checked={props.selected}
        onClick={e => {
          e.preventDefault()
          props.handleDocumentSelect(doc)
        }}
      />
      <ListItemBorderLeft categoryId={props.document.category.id} />
      <ItemRenderer
        {...{
          ...props,
          numColumns: 3,
          itemsToDisplay: itemsToDisplay(),
          printExtraActionsMenu: () => printExtraActionsMenu(props)
        }}
      />
    </DocumentListRow>
  )
}

const printExtraActionsMenu = (props: Props) => {
  return (
    <>
      <div data-test-id={'view-button'}>{renderOnViewClick(props.viewDocumentOption)}</div>
      <div data-test-id={'ellipsis'}>{props.renderEllipsisMenu(props.document)}</div>
    </>
  )
}

const renderOnViewClick = (viewDocumentOption: DropdownOption) => {
  const enabled = viewDocumentOption && !viewDocumentOption.disabled
  return (
    <Button disabled={!enabled} onClick={viewDocumentOption.onClick}>
      View
    </Button>
  )
}

const itemsToDisplay = () => {
  return [Items.TYPE, Items.FORMAT, Items.UPLOADED_ON, Items.NAME, Items.SIZE, Items.UPLOADER]
}

const DocumentListRow = styled.div`
  min-width: 986px;
  min-height: 40px;
  display: grid;
  grid-template-columns: 40px [cbox] 5px [border] auto [list-item];
  align-items: center;
  margin: 8px 0;
`
