import * as React from 'react'
import { List, Accordion, AccordionPanelProps, Checkbox, Icon } from 'semantic-ui-react'
import styled from 'styled-components'
import { indigo, darkViolet } from '../../../../styles/colors'

import { DocumentType, Category } from '../../../document-management/store/types'
import { groupBy } from '../../../document-management/components/documents/my-documents/toMap'

import { PanelCheckboxState } from '../templates/DocumentRequestModal'

export interface Props {
  documentTypes: DocumentType[]
  categories: Category[]
  selectedDocumentTypesByCategory: Map<string, DocumentType[]>
  panelCheckboxState: Map<string, PanelCheckboxState>
  markAsDisabled: (documentTypeName: string) => { isDisabled: boolean; disabledText: string }
  isSelected(documentType: DocumentType): boolean
  onPanelClick(category: Category): void
  onListItemClick(documentType: DocumentType): void
}

class DocumentTypesByCategory extends React.Component<Props> {
  render() {
    return (
      <StyledAccordion
        exclusive={false}
        fluid={true}
        panels={this.props.categories.map(this.categoryToAccordionPanel)}
      />
    )
  }

  private categoryToAccordionPanel = (category: Category): AccordionPanelProps => {
    return {
      key: category.id,
      name: category.name,
      title: { content: this.categoryToPanelTitle(category) },
      content: { content: this.categoryToList(category) }
    }
  }

  private categoryToPanelTitle = (category: Category) => {
    return (
      <>
        <StyledIcon name="chevron down" />
        <StyledCheckbox
          key={category.id}
          floated="left"
          label={category.name}
          checked={this.props.panelCheckboxState.get(category.id) === 1}
          indeterminate={this.props.panelCheckboxState.get(category.id) === 0}
          onClick={(e: React.MouseEvent) => {
            e.preventDefault()
            e.stopPropagation()
            this.props.onPanelClick(category)
          }}
        />
      </>
    )
  }

  private categoryToList = (category: Category) => {
    const groupByCategoryId = (docType: DocumentType) => docType.category.id
    const documentTypesForThisCategory = groupBy(this.props.documentTypes, groupByCategoryId).get(category.id)
    if (!(documentTypesForThisCategory && documentTypesForThisCategory.length)) {
      return null
    }

    return (
      <List
        selection={true}
        name={<b>category.name</b>}
        items={documentTypesForThisCategory.map(this.documentTypeToListItem)}
      />
    )
  }

  private documentTypeToListItem = (documentType: DocumentType) => {
    // default values
    let disabledText: string = ''
    let isDisabled: boolean = false

    // override defaults if markAsDisabled function is provided
    if (this.props.markAsDisabled) {
      const result = this.props.markAsDisabled(documentType.name)
      if (result.isDisabled) {
        disabledText = result.disabledText
        isDisabled = result.isDisabled
      }
    }
    return (
      <List.Item style={{ padding: '7px 2.5em' }}>
        <List.Content key={documentType.id} floated="left">
          <Checkbox
            disabled={false} // We are allowing to re-request same document several times
            label={documentType.name}
            onClick={() => this.props.onListItemClick(documentType)}
            checked={this.props.isSelected(documentType)}
          />
        </List.Content>
        <List.Content key={documentType.id} floated="right">
          <p className="disabled" hidden={!isDisabled}>
            {disabledText}
          </p>
        </List.Content>
      </List.Item>
    )
  }
}

export const StyledAccordion = styled(Accordion)`
  &&& {
    .komgo-accordion-title {
      background-color: ${indigo} !important;
      border-radius: 5px;
      border: 1px solid ${darkViolet};
      padding: 12px 30px;
      height: 45px;
      color: white;
    }

    .title .dropdown.icon {
      display: none;
    }

    .active .komgo-accordion-title {
      border-radius: 5px 5px 0px 0px;
      margin-bottom: -14px;
    }

    i {
      color: white;
      margin-top: 2px;
    }
  }
`

const StyledCheckbox = styled(Checkbox)`
  &&& {
    padding-left: 1em;
    label {
      font-weight: bold;
    }
    .dropdown.icon {
      display: none;
    }
  }
`

const StyledIcon = styled(Icon)`
  &&& {
    width: 16px;
  }
`

export default DocumentTypesByCategory
