import * as React from 'react'
import { Dropdown, DropdownItemProps } from 'semantic-ui-react'

import { truncate } from '../../../../utils/casings'
import { Category, FILTERS_NAME, DocumentsFilters } from '../../store'

export interface Props {
  filters: DocumentsFilters
  categories: Category[]
  disabled: boolean
  onCategorySelect(filter: string, value: string): void
}

const ALL_CATEGORIES: DropdownItemProps = {
  key: 'all',
  text: 'All categories',
  value: 'all',
  content: 'All categories'
}

export const SelectCategoryDropdown = (props: Props) => {
  return (
    <Dropdown
      inline={true}
      options={[ALL_CATEGORIES, ...props.categories.map(categoryToOption)]}
      defaultValue={props.filters.selectedCategoryId || ALL_CATEGORIES.value}
      value={props.filters.selectedCategoryId || ALL_CATEGORIES.value}
      onChange={(e: React.SyntheticEvent, { value }: any) => {
        props.onCategorySelect(FILTERS_NAME.CATEGORY, value)
      }}
      button={true}
      disabled={props.disabled}
    />
  )
}

const categoryToOption = (category: Category): DropdownItemProps => {
  return {
    key: category.id,
    text: truncate(category.name, 14),
    value: category.id,
    content: category.name
  }
}
