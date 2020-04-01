import * as React from 'react'
import styled from 'styled-components'
import { Dropdown } from 'semantic-ui-react'

import { DocumentType, Document } from '../../../store'

import { useAttachDocumentDropdownState } from './useAttachDocumentDropdownState'
export interface Props {
  documentType: DocumentType
  automatchCount: number
  attachedDocument: Document | undefined
  disabled?: boolean
  toggleAutomatchModalVisible(documentType: DocumentType): void
  toggleAddDocumentModalVisible(documentTYpe: DocumentType): void
}

export interface State {
  attachedForm: Document | null
}

export const AttachDocumentsDropdown = (props: Props) => {
  const dropdownDisabled = useAttachDocumentDropdownState({ disabled: false, attachedDocument: props.attachedDocument })

  return (
    <Dropdown
      data-test-id={`attach-documents-button-${props.documentType.name}`}
      text="Attach document"
      button={true}
      icon="dropdown"
      fluid={true}
      style={{ width: '238px' }}
      disabled={dropdownDisabled || !!props.disabled}
    >
      <Dropdown.Menu>
        <Dropdown.Item
          data-test-id={`automatch-button-${props.documentType.name}`}
          content={renderAutomatchItemContent(props.automatchCount)}
          onClick={() => props.toggleAutomatchModalVisible(props.documentType)}
          disabled={props.automatchCount === 0}
        />
        <Dropdown.Item
          data-test-id={`add-document-button=${props.documentType.name}`}
          content={'Upload new'}
          onClick={() => props.toggleAddDocumentModalVisible(props.documentType)}
        />
      </Dropdown.Menu>
    </Dropdown>
  )
}

const renderAutomatchItemContent = (automatchCount: number = 0) => {
  const selectFromLibraryLabel = 'Select from library'
  const selectFromLibrary =
    automatchCount === 0 ? (
      <StyledSelectFromLibraryDisabled>{selectFromLibraryLabel}</StyledSelectFromLibraryDisabled>
    ) : (
      <StyledSelectFromLibrary>{selectFromLibraryLabel}</StyledSelectFromLibrary>
    )
  return (
    <PointlesslyElongatedMenuContent>
      {selectFromLibrary}
      <StyledAutomatchCount>{`[ ${automatchCount} automatch ]`}</StyledAutomatchCount>
    </PointlesslyElongatedMenuContent>
  )
}

const PointlesslyElongatedMenuContent = styled.div`
  &&& {
    display: flex;
    justify-content: space-between;
    width: 348px;
  }
`

const StyledSelectFromLibrary = styled.span`
  &&& {
    color: #1c2936;
    font-size: 14px;
  }
`

const StyledSelectFromLibraryDisabled = styled.span`
  &&& {
    color: #7f95aa;
    font-size: 14px;
  }
`

const StyledAutomatchCount = styled.span`
  &&& {
    color: #5d768f;
    font-size: 13px;
  }
`
