import * as React from 'react'
import styled from 'styled-components'
import { DocumentResponse, HasId } from '../../document-management'
import { EllipsisDropdown } from '../../document-management/components/dropdowns/EllipsisDropdown'
import { DropdownOption } from '../../document-management/components/documents/my-documents/DocumentListDropdownOptions'
import { Image, List } from 'semantic-ui-react'
import Text from '../../../components/text'

export interface IDocumentItem extends HasId {
  name: string
  typeName: string
}

interface DocumentListItemProps {
  document: IDocumentItem
  renderDropdownOptions: (document: IDocumentItem) => DropdownOption[]
}

export const DocumentListItem: React.FC<DocumentListItemProps> = ({ document, renderDropdownOptions }) => (
  <List.Item data-test-id={document.name}>
    <List.Content floated="right">
      <EllipsisDropdown options={renderDropdownOptions} item={document} style={{ paddingRight: 0 }} />
    </List.Content>
    <Image src="/images/file.svg" inline={true} spaced="right" />
    <List.Content>
      <Text bold={true}>{document.name}</Text>
    </List.Content>
    <StyledContentMiddle>{document.typeName}</StyledContentMiddle>
  </List.Item>
)

const StyledContentMiddle = styled(List.Content)`
  display: inline;
  left: 50%;
  margin-right: -50%;
  position: absolute;
  text-align: left;
  line-height: 1.9rem !important;
`
