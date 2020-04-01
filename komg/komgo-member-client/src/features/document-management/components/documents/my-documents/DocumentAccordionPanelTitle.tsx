import * as React from 'react'
import { Checkbox, Dropdown, Icon } from 'semantic-ui-react'
import styled from 'styled-components'

import { DocumentType } from '../../../store/types'

interface Props {
  documentType: DocumentType
  documentCount: number
  selected: boolean
  indeterminate: boolean
  numberOfDocuments?: number
  handleDocumentTypeCheckboxTick(documentType: DocumentType): void
  renderDocumentTypeExtraFunctionality(documentType: DocumentType): React.ReactNode
}

export const DocumentAccordionPanelTitle = (props: Props) => {
  const dropdownEllipsesStyle: React.CSSProperties = { display: 'inline', float: 'right' }
  const handleCheckbox = (e: React.FormEvent<HTMLInputElement>) => {
    props.handleDocumentTypeCheckboxTick(props.documentType)
  }

  return (
    <React.Fragment>
      <StyledIcon name="chevron down" />
      <StyledCheckbox
        label={`${props.documentType.name} (${props.documentCount})`}
        checked={props.selected}
        id={props.documentType.id}
        indeterminate={props.indeterminate}
        onClick={handleCheckbox}
        disabled={props.numberOfDocuments === 0}
      />
      {props.renderDocumentTypeExtraFunctionality(props.documentType)}
    </React.Fragment>
  )
}

const StyledCheckbox = styled(Checkbox)`
  &&& {
    padding-left: 1em;
    label {
      font-weight: bold;
    }
  }
`

const StyledIcon = styled(Icon)`
  &&& {
    width: 16px;
  }
`
