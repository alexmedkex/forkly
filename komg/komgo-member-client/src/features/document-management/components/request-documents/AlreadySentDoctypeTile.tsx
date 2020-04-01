import React, { useState } from 'react'
import { DocumentLibraryPanel } from '../documents/document-library/OurDocumentsPanelItem'
import { DocumentType, Document, Category } from '../../store'
import { CategoryDocumentCount } from '../documents/document-library/OurDocumentsPanelItem'
import { Icon } from 'semantic-ui-react'
import { ListItemBorderLeft } from '../documents/document-library/ListItemBorderLeft'
import { AlreadySentDocumentTile } from './AlreadySentDocumentTile'
import styled from 'styled-components'

interface IProps {
  counterpartyId: string
  active: boolean
  docType: DocumentType
  documents: Document[]
  category: Category
  openViewDocument(previewDocumentId: string): void
}

export const AlreadySentDoctypeTile: React.FC<IProps> = (props: IProps) => {
  const [tileVisible, setTileVisible] = useState(false)
  const { category, docType, documents } = props
  const toggleVisible = () => {
    setTileVisible(!tileVisible)
  }
  return (
    <StyledTile data-test-id={`requirements-tile-${docType.name}`}>
      <ListItemBorderLeft borderStyle={`0 4px ${tileVisible ? 0 : 4}px 0`} categoryId={docType.category.id} />
      {renderHeader(category, tileVisible, docType, documents.length, toggleVisible)}
      {tileVisible && <ListItemBorderLeft borderStyle={'0 0px 4px 0'} categoryId={docType.category.id} />}
      {tileVisible && renderBody(documents, props.openViewDocument, props.counterpartyId)}
    </StyledTile>
  )
}

const renderHeader = (
  category: Category,
  active: boolean,
  docType: DocumentType,
  numDocuments: number,
  toggleTile: () => void
) => {
  return (
    <>
      <DocumentLibraryPanel key={`panel-content-${category.id}`} onClick={toggleTile}>
        <DoctypeName data-test-id={`document-type-tile-name-${category.name}`}>{docType.name}</DoctypeName>
        <StyledDiv>
          <CategoryDocumentCount
            data-test-id={`document-type-tile-count-${category.name}`}
          >{`[ ${numDocuments} ]`}</CategoryDocumentCount>
        </StyledDiv>
      </DocumentLibraryPanel>
      <Icon
        styles={{ float: 'right' }}
        data-test-id={`document-type-tile-chevron-${category.name}`}
        name={active ? 'chevron down' : 'chevron right'}
        size="large"
        onClick={toggleTile}
      />
    </>
  )
}

const renderBody = (documents: Document[], openViewDocument: (docId) => void, counterpartyId: string) => {
  return (
    <StyledContent>
      {documents.map((d, i) => {
        return (
          <AlreadySentDocumentTile
            counterpartyId={counterpartyId}
            document={d}
            key={d.id}
            index={i + 1}
            openViewDocument={openViewDocument}
          />
        )
      })}
    </StyledContent>
  )
}

const StyledDiv = styled.div`
  padding: 5px 0;
`

export const StyledContent = styled.div`
  cursor: default;
  padding: 10px 0 10px 0;
  display: grid;
  grid-template-columns: auto [panel-item] 50% [panel-item];
  align-items: center;
`

export const StyledTile = styled.div`
  cursor: pointer;
  width: calc(100% - 30px);
  margin: 10px 0;
  border: 1px solid #e8eef3;
  border-radius: 4px;
  display: grid;
  grid-template-columns: 5px [color] auto [panel-item] 35px [chevron];
  align-items: center;
  grid-column-gap: 0.5rem;
  margin-left: 15px;
  margin-rigth: 10px;
`

const DoctypeName = styled.div`
  padding: 5px 15px 5px 5px;
  height: 21px;
  color: #1c2936;
  text-rendering: geometricPrecision;
  font-size: 14px;
  font-weight: 600;
  line-height: 21px;
`
