import * as React from 'react'
import { Button, Dropdown, Grid, Header, Icon } from 'semantic-ui-react'

import styled from 'styled-components'

import { Document } from '../../store/types'
import { Counterparty } from '../../../../features/counterparties/store/types'

interface Props {
  loadedDocument: Document
  sharedByCounterparty: Counterparty | undefined
  goBack(): void
  onShareDocument(): void
  onDeleteDocument(): void
  onDownloadDocument(): void
}

export const FlexHeader = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  padding: 17px 30px;
`

const DocumentViewHeader: React.FC<Props> = (props: Props) => {
  return (
    <FlexHeader>
      <BackArrow goBack={props.goBack} />
      <DocumentName name={props.loadedDocument.name} />
      <Button content="Download" onClick={() => props.onDownloadDocument()} style={{ justifySelf: 'flex-end' }} />
      <EllipsisButton
        loadedDocument={props.loadedDocument}
        onDeleteDocument={props.onDeleteDocument}
        onShareDocument={props.onShareDocument}
      />
    </FlexHeader>
  )
}

const BackArrow: React.FC<{ goBack(): void }> = ({ goBack }) => {
  return (
    <Icon
      name="arrow left"
      size="large"
      onClick={() => goBack()}
      style={{ cursor: 'pointer', fontSize: '1em', fontWeight: '100' }}
    />
  )
}

const EllipsisButton: React.FC<{ loadedDocument: Document; onDeleteDocument(): void; onShareDocument(): void }> = ({
  loadedDocument,
  onShareDocument,
  onDeleteDocument
}) => {
  return loadedDocument.product.id !== 'tradeFinance' && loadedDocument.sharedBy === 'none' ? (
    <StyledDropdown
      button={true}
      className="icon icon-button"
      icon={'ellipsis horizontal'}
      style={{ justifySelf: 'flex-end' }}
    >
      <Dropdown.Menu>
        <Dropdown.Item onClick={onDeleteDocument}>Delete</Dropdown.Item>
        <Dropdown.Item onClick={onShareDocument}>Share</Dropdown.Item>
      </Dropdown.Menu>
    </StyledDropdown>
  ) : null
}

const StyledDropdown = styled(Dropdown)`
  &&&&&&& {
    i.ellipsis.horizontal.icon {
      border-color: transparent !important;
      background: transparent !important;
    }
  }
`

const DocumentName = ({ name }) => <Header as="h1" content={name} style={{ margin: '12px', flexGrow: 2 }} />

export default DocumentViewHeader
