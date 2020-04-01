import * as React from 'react'
import styled from 'styled-components'
import { Button } from 'semantic-ui-react'

import { Document } from '../../../store'
import { toMegabytes } from '../../../../../utils/casings'
import { displayDate } from '../../../../../utils/date'

import { ListItemField } from './ListItemField'

export interface Props {
  document: Document
  highlighted: boolean
  itemsToDisplay: Items[]
  numColumns: number
  getUserNameFromDocumentUploaderId?(idUser: string): string // Its optional, as its only used if we are going to display UPLOADER item
  printExtraActionsMenu(): React.ReactNode
}

export enum Items {
  TYPE,
  FORMAT,
  UPLOADED_ON,
  NAME,
  SIZE,
  UPLOADER
}

const displayItem = (item: Items, props: Props) => {
  const doc = props.document
  const [docName, ext] = doc.name.split('.')
  const size = getDocumentSize(doc.content as any)
  switch (item) {
    case Items.TYPE:
      return <ListItemField label="Type" value={doc.type.name} dataTestId={'field-type'} />
    case Items.FORMAT:
      return <ListItemField label="Format" value={ext ? ext.toUpperCase() : ''} dataTestId={'field-format'} />
    case Items.UPLOADED_ON:
      return (
        <ListItemField
          label="Uploaded on"
          value={displayDate(doc.registrationDate, 'DD MMM YYYY')}
          dataTestId={'field-uploaded'}
        />
      )
    case Items.NAME:
      return <ListItemField label="Name" value={docName} dataTestId={'field-name'} />
    case Items.SIZE:
      return <ListItemField label="Size" value={size} dataTestId={'field-size'} />
    case Items.UPLOADER:
      return <ListItemField label="Uploader" value={getUploaderName(props)} dataTestId={'field-uploader'} />
  }
}

export const DocumentListItem = (props: Props) => {
  return (
    <ListItemGrid highlighted={props.highlighted}>
      <FieldGrid data-test-id={'field-grid'} numColumns={props.numColumns}>
        {props.itemsToDisplay.map(item => displayItem(item, props))}
      </FieldGrid>
      {props.printExtraActionsMenu()}
    </ListItemGrid>
  )
}

const getUploaderName = (props: Props) => {
  if (props.document.uploadInfo && props.getUserNameFromDocumentUploaderId) {
    return props.getUserNameFromDocumentUploaderId(props.document.uploadInfo.uploaderUserId)
  }
  return 'Unknown'
}

const getDocumentSize = (content: { size: string }) => (content && content.size ? toMegabytes(content.size) : 'Unknown')

const ListItemGrid = styled.div`
  height: 72px;
  max-height: 100%;
  border: 1px solid #e8eef3;
  border-radius: 4px;
  background-color: #ffffff;
  display: grid;
  grid-template-columns: auto [fields] 70px [view-button] 40px [ellipsis];
  align-items: center;
  background-color: ${(props: { highlighted: boolean }) => (props.highlighted ? '#f2f5f8' : 'white')};
`

const FieldGrid = styled.div`
  display: grid;
  grid-template-columns: ${(props: { numColumns: number }) => 'minmax(14em, 1fr) '.repeat(props.numColumns) + ';'};
  grid-template-rows: 28px;
  grid-column-gap: 2rem;
`
