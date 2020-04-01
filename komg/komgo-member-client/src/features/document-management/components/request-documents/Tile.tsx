import * as React from 'react'
import styled from 'styled-components'

import { DocumentType } from '../../store'
import { ListItemBorderLeft } from '../documents/document-library/ListItemBorderLeft'
import { Popup } from 'semantic-ui-react'

export interface Props {
  documentType: DocumentType
  renderItems: () => React.ReactNode
}

export const TileWithItems = (props: Props) => {
  const documentType = props.documentType
  if (!documentType) {
    return null
  }

  const typeNameElement = () => (
    <TypeName data-test-id={`requirement-field-name-${documentType.name}`}>{documentType.name}</TypeName>
  )
  return (
    <StyledTile data-test-id={`requirements-tile-${documentType.name}`}>
      <ListItemBorderLeft categoryId={documentType.category.id} />
      {addPopup(documentType.name, typeNameElement())}
      {props.renderItems()}
    </StyledTile>
  )
}

const addPopup = (popupText: string, component: JSX.Element) => {
  return popupText && popupText.length > 41 ? (
    <Popup on="hover" content={popupText} position="top center" inverted={true} trigger={component} />
  ) : (
    <>{component}</>
  )
}

export const StyledTile = styled.div`
  height: 42px;
  width: calc(100% - 14px);
  margin: 4px 0;
  border: 1px solid #e8eef3;
  border-radius: 4px;
  display: grid;
  grid-template-columns: 5px [border] 1fr [type-name] 1fr [add-requirements-btn] 1fr [attach-document-btn] 28px [remove-icon];
  align-items: center;
  grid-column-gap: 0.5rem;
`

export const TypeName = styled.div`
  color: #1c2936;
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

export const DocumentNameCell = styled.div`
  max-width: 14em;
  display: flex;
  justify-content: space-between;
`
