import * as React from 'react'
import { Category, DocumentType, DocumentListFilter } from '../../store/types'
import {
  FilterWrapper,
  buildFilterItem,
  CheckboxFilter,
  CheckboxTreeFilter,
  IFilterItemBase,
  ICheckboxOptionGroup,
  ICheckboxOption
} from '@komgo/ui-components'
import { Counterparty } from '../../../counterparties/store/types'
import { getDocumentTypeFilterOptions } from './utils'

export interface IDocumentFilterProps {
  categories: Category[]
  counterparties: Counterparty[]
  types: DocumentType[]
  filter: DocumentListFilter
  disabled?: boolean
  onChange(filter: DocumentListFilter): void
}

export class DocumentFilter extends React.Component<IDocumentFilterProps> {
  handleApply = (filter: DocumentListFilter) => {
    this.props.onChange(filter)
  }

  handleClear = () => {
    this.props.onChange(null)
  }

  buildFilters(
    types: ICheckboxOptionGroup[],
    counterparties: ICheckboxOption[]
  ): Array<IFilterItemBase<DocumentListFilter>> {
    return [
      buildFilterItem(
        'Type',
        'type',
        (filter: DocumentListFilter) => filter.type || [],
        props => <CheckboxTreeFilter options={types} {...props} />,
        (filters: string[]) => (filters ? filters.length : 0)
      ),
      buildFilterItem(
        'Shared with',
        'sharedWith',
        (filter: DocumentListFilter) => filter.sharedWith || [],
        props => <CheckboxFilter {...props} items={counterparties} />,
        (filters: string[]) => (filters ? filters.length : 0)
      )
    ]
  }

  getTypes() {
    return this.props.categories && this.props.types
      ? getDocumentTypeFilterOptions(this.props.categories, this.props.types)
      : []
  }

  getCounterparties(): ICheckboxOption[] {
    return this.props.counterparties
      ? this.props.counterparties.map(c => ({
          value: c.staticId,
          name: c.x500Name.CN
        }))
      : []
  }

  render() {
    const filters = this.buildFilters(this.getTypes(), this.getCounterparties())

    return (
      <FilterWrapper
        filters={filters}
        clearedFilters={{ type: [], sharedWith: [] }}
        appliedFilters={this.props.filter || {}}
        onApply={this.handleApply}
        onClear={this.handleClear}
        disabled={this.props.disabled}
      />
    )
  }
}
