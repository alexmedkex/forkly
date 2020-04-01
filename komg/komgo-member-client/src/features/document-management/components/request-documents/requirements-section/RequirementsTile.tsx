import { SPACES } from '@komgo/ui-components'
import * as React from 'react'
import styled from 'styled-components'
import { Button } from 'semantic-ui-react'

import { AttachDocumentsDropdown } from './AttachDocumentsDropdown'

import { DocumentType, Document } from '../../../store'
import { TileWithItems } from '../Tile'

import { BottomSheetStatus } from '../../../../bottom-sheet/store/types'
import { CustomLargeCloseIcon } from '../../../../../components/custom-icon'
import { truncate } from '../../../../../utils/casings'
import SpanAsLink from '../../../../../components/span-as-link/SpanAsLink'

export interface Props {
  documentType: DocumentType[]
  typeDocuments: Document[]
  attachedDocument: Document | undefined
  toggleAutomatchModalVisible(documentType: DocumentType): void
  toggleAddDocumentModalVisible(documentType: DocumentType): void
  removeAttachedDocument(documentTypeId: string, documentId: string): void
  toggleSelectionDocumentType(documentTypeId: string): void
  openViewDocument(id: string): void
}
export const RequirementsTile = (props: Props) => {
  const [documentType] = props.documentType
  const charactersToTruncate = 33
  if (!documentType) {
    return null
  }
  const renderTileItems = () => {
    return (
      <>
        <Button
          data-test-id={`requirements-add-button-${documentType.name}`}
          content="+ Add"
          style={{ width: '68px' }}
          default={true}
          disabled={true}
        />
        {props.attachedDocument && props.attachedDocument.state === BottomSheetStatus.REGISTERED ? (
          <React.Fragment>
            <DocumentNameCell data-test-id={`attached-document-name-${documentType.id}`}>
              <TypeName>{truncate(props.attachedDocument.name, charactersToTruncate)}</TypeName>
              <StyledAttachmentTileIcon
                onClick={() => props.removeAttachedDocument(documentType.id, props.attachedDocument.id)}
                data-test-id={`remove-document-${props.attachedDocument.name}`}
              />
              <SpanAsLinkWrap
                onClick={() => props.openViewDocument(props.attachedDocument.id)}
                data-test-id={`view-document-${props.attachedDocument.name}`}
              >
                View
              </SpanAsLinkWrap>
            </DocumentNameCell>
          </React.Fragment>
        ) : (
          <AttachDocumentsDropdown
            documentType={documentType}
            automatchCount={props.typeDocuments.length}
            attachedDocument={props.attachedDocument}
            toggleAddDocumentModalVisible={props.toggleAddDocumentModalVisible}
            toggleAutomatchModalVisible={props.toggleAutomatchModalVisible}
          />
        )}
        <StyledCustomLargeCloseIcon
          data-test-id={`remove-type-icon-${documentType.name}`}
          onClick={() => props.toggleSelectionDocumentType(documentType.id)}
        />
      </>
    )
  }
  return <TileWithItems documentType={documentType} renderItems={renderTileItems} />
}

const Tile = styled.div`
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

const TypeName = styled.div`
  color: #1c2936;
  font-size: 14px;
  font-weight: 600;
  width: 238px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`
const DocumentNameCell = styled.div`
  max-width: 281px;
  display: flex;
  justify-content: space-between;
`

const StyledCustomLargeCloseIcon = styled(CustomLargeCloseIcon)`
  cursor: pointer;
  stroke: #c0cfde;

  &:hover {
    stroke: #5d768f;
  }
`

const StyledAttachmentTileIcon = styled(CustomLargeCloseIcon)`
  height: 16px;
  width: 16px;
  padding: 4px;
  stroke-width: 3;
  stroke: #5d768f;
  cursor: pointer;
`

const SpanAsLinkWrap = styled(SpanAsLink)`
  margin-left: ${SPACES.DEFAULT};
`
