import * as React from 'react'
import styled from 'styled-components'
import { Checkbox, Icon } from 'semantic-ui-react'

import { Category } from '../../../store'
import { pluralize } from '../../../../../utils/casings'

import { PanelItemColorIcon } from './PanelItemColorIcon'
import { CategoryWithColourTag } from './CategoryWithColourTag'

export interface Props {
  active: boolean
  category: Category
  documentCount: number
  checked: boolean
  indeterminate: boolean
  handleCategorySelect(categoryId: string): void
  onTitleClick(): void
}

export const OurDocumentsPanelItem = (props: Props) => {
  return (
    <DocumentPanelRow key={props.category.id} onClick={props.onTitleClick}>
      <Checkbox
        data-test-id={`checkbox-${props.category.name}`}
        checked={props.checked}
        indeterminate={props.indeterminate}
        onClick={e => {
          e.stopPropagation()
          e.preventDefault()
          props.handleCategorySelect(props.category.id)
        }}
      />
      <DocumentLibraryPanel key={`panel-content-${props.category.id}`}>
        <CategoryWithColourTag category={props.category} />
        <CategoryDocumentCount data-test-id={`document-count-${props.category.name}`}>{`${
          props.documentCount
        } ${pluralize('document', props.documentCount)}`}</CategoryDocumentCount>
      </DocumentLibraryPanel>
      <Icon
        data-test-id={`row-chevron-${props.category.name}`}
        name={props.active ? 'chevron down' : 'chevron right'}
        size="large"
      />
    </DocumentPanelRow>
  )
}

export const DocumentPanelRow = styled.div`
  display: grid;
  align-items: center;
  grid-template-rows: 40px;
  grid-template-columns: 40px [cbox] auto [panel-item] 40px [chevron];
`

export const DocumentLibraryPanel = styled.div`
  min-width: calc(100% - 30px);
  background-color: #ffffff;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
`

export const CategoryDocumentCount = styled.p`
  font-size: 11px;
  font-weight: 600;
  line-height: 21px;
  text-transform: uppercase;
  color: #5d768f;
`
