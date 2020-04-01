import { green, violetBlue } from '@komgo/ui-components'
import * as React from 'react'
import { Checkbox, Image, Label, List } from 'semantic-ui-react'
import styled from 'styled-components'
import Text from '../../../../../components/text'
import { dark } from '../../../../../styles/colors'
import { HasId, SharedWith } from '../../../../document-management'
import { DropdownOption } from '../../../../document-management/components/documents/my-documents/DocumentListDropdownOptions'
import { EllipsisDropdown } from '../../../../document-management/components/dropdowns/EllipsisDropdown'
export interface IDocumentItem extends HasId {
  name: string
  typeName: string
  sharedWith: SharedWith[]
  ownerCompanyId: string
}

interface DocumentListItemProps {
  document: IDocumentItem
  companyStaticId: string
  counterpartyId: string
  renderDropdownOptions: () => DropdownOption[]
  checked: boolean
  disabled: boolean
  enforceDocumentIcon: boolean
  handleClickDocumentItemCheckbox: (id: string, checked: boolean, disabled: boolean) => void
}

export const documentIsShared = (document: IDocumentItem, counterpartyId: string): boolean => {
  if (document && document.sharedWith && document.sharedWith[0]) {
    for (const shareCounterparty of document.sharedWith) {
      if (shareCounterparty.counterpartyId === counterpartyId) {
        return true
      }
    }
  }

  return false
}

export const documentIsReceived = (document: IDocumentItem, companyStaticId: string): boolean => {
  if (document && document.ownerCompanyId) {
    if (document.ownerCompanyId !== companyStaticId) {
      return true
    }
  }

  return false
}

export const DocumentCheckbox = ({
  id,
  name,
  checked,
  disabled,
  handleClickDocumentItemCheckbox
}: {
  id: string
  name: string
  checked: boolean
  disabled: boolean
  handleClickDocumentItemCheckbox: (id: string, checked: boolean, disabled: boolean) => void
}) => (
  <StyledCheckbox
    key={id}
    floated="left"
    label={name}
    checked={checked}
    disabled={disabled}
    indeterminate={false}
    onClick={() => handleClickDocumentItemCheckbox(id, !checked, disabled)}
  />
)

export const DocumentIcon = ({ name }: IDocumentItem) => (
  <>
    <Image src="/images/file.svg" inline={true} spaced="right" style={{ paddingRight: '0.4em' }} />
    <List.Content>
      <Text bold={true}>{name}</Text>
    </List.Content>
  </>
)

export const DocumentListItem: React.FC<DocumentListItemProps> = ({
  document,
  companyStaticId,
  renderDropdownOptions,
  checked,
  disabled,
  counterpartyId,
  enforceDocumentIcon,
  handleClickDocumentItemCheckbox
}) => (
  <List.Item data-test-id={document.name}>
    {enforceDocumentIcon || documentIsReceived(document, companyStaticId) ? (
      <DocumentIcon {...document} />
    ) : (
      <DocumentCheckbox
        id={document.id}
        name={document.name}
        checked={checked}
        disabled={disabled}
        handleClickDocumentItemCheckbox={handleClickDocumentItemCheckbox}
      />
    )}
    <StyledContentMiddle>{document.typeName}</StyledContentMiddle>
    <EllipsisDropdownWrapper floated="right">
      {documentIsShared(document, counterpartyId) ? <SharedBadge>Shared</SharedBadge> : null}
      {documentIsReceived(document, companyStaticId) ? <ReceivedBadge>Received</ReceivedBadge> : null}
      <EllipsisDropdown options={renderDropdownOptions} item={document} style={{ paddingRight: 0 }} />
    </EllipsisDropdownWrapper>
  </List.Item>
)

const EllipsisDropdownWrapper = styled(List.Content)`
  &&& {
    display: flex;
    align-items: center;
  }
`
EllipsisDropdownWrapper.displayName = 'EllipsisDropdownWrapper'

const SharedBadge = styled(Label)`
  &&& {
    background-color: ${violetBlue};
    border-color: ${violetBlue};
    color: white;
    margin-right: 22px;
  }
`

const ReceivedBadge = styled(Label)`
  &&& {
    background-color: ${green};
    border-color: ${green};
    color: white;
    margin-right: 22px;
  }
`

export const StyledContentMiddle = styled(List.Content)`
  display: inline;
  left: 50%;
  margin-right: -50%;
  position: absolute;
  text-align: left;
  line-height: 1.9rem !important;
`
StyledContentMiddle.displayName = 'StyledContentMiddle'

const StyledCheckbox = styled(Checkbox)`
  &&& {
    label {
      color: ${dark};
      font-size: 14px;
      font-weight: 600;
      line-height: 21px;
    }
    .dropdown.icon {
      display: none;
    }
  }
`
