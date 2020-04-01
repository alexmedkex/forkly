import * as React from 'react'
import { List, Checkbox, Dropdown } from 'semantic-ui-react'
import styled from 'styled-components'

import { Document } from '../../../store/types'
import { displayDateAndTime } from '../../../../../utils/date'
import { getDocumentOwner, getDocumentParcelId } from '../../../utils/selectors'

interface Props {
  document: Document
  selected: boolean
  sentToCounterparty: boolean
  showAdditionalProps?: string[]
  isHighlighted?: boolean
  renderDocumentExtraFunctionality(document: Document, sentToCounterparty: boolean): React.ReactNode
  toggleSelected(doc: Document): void
}

export const DocumentsListItem = (props: Props) => {
  const { document, showAdditionalProps } = props

  const handleCheckbox = (e: React.FormEvent<HTMLInputElement>) => {
    e.stopPropagation()
    props.toggleSelected(props.document)
  }

  const printAdditionalInfo = (prop: string): React.ReactNode => {
    if (prop === 'parcelId') {
      const parcel = getDocumentParcelId(document)
      return (
        <StyledAdditionInfo key={prop} numberOfProps={showAdditionalProps!.length}>
          {parcel !== '' ? `Parcel #${parcel}` : ''}
        </StyledAdditionInfo>
      )
    }

    if (prop === 'registrationDate') {
      return (
        <StyledAdditionInfo key={prop} numberOfProps={showAdditionalProps!.length}>
          {displayDateAndTime(document[prop])}
        </StyledAdditionInfo>
      )
    }

    if (prop === 'owner') {
      const name = getDocumentOwner(document)
      return (
        <StyledAdditionInfo key={prop} numberOfProps={showAdditionalProps!.length}>
          {name}
        </StyledAdditionInfo>
      )
    }

    return (
      <StyledAdditionInfo key={prop} numberOfProps={showAdditionalProps!.length}>
        {document[prop]}
      </StyledAdditionInfo>
    )
  }

  return (
    <StyledListItem
      key={props.document.id}
      name={props.document.name}
      style={{ backgroundColor: `${props.isHighlighted ? '#f2f5f8' : 'white'}` }}
    >
      <StyledListContent floated="right">
        {props.renderDocumentExtraFunctionality(document, props.sentToCounterparty)}
      </StyledListContent>
      <StyledListContent>
        <StyledCheckbox
          disabled={props.sentToCounterparty}
          label={document.name}
          onClick={handleCheckbox}
          checked={props.selected || props.sentToCounterparty}
        />
        {showAdditionalProps && (
          <StyledAdditionInfoWrapper>
            {showAdditionalProps.map(prop => printAdditionalInfo(prop))}
          </StyledAdditionInfoWrapper>
        )}
      </StyledListContent>
    </StyledListItem>
  )
}

const StyledListItem = styled(List.Item)`
  &&&&& {
    padding: 1em 0;
    max-height: 50px;
  }
`

const StyledDropdown = styled(Dropdown)`
  padding-right: 0.5em;
`

const StyledCheckbox = styled(Checkbox)`
  min-width: 30%;
  padding-left: 4em;
`

interface IStyledAdditionInfo {
  numberOfProps: number
}

const StyledAdditionInfoWrapper = styled.div`
  float: right;
  width: 60%;
`

const StyledAdditionInfo = styled.div`
  float: left;
  width: ${(props: IStyledAdditionInfo) => `${100 / props.numberOfProps}%`};
`

const StyledListContent = styled(List.Content)`
  &&&&& {
    padding-top: 0;
    padding-bottom: 0;
    padding-right: 0;
  }
`
