import * as React from 'react'
import { Category, DocumentType, CounterpartyDocumentFilter } from '../../store/types'
import {
  FilterWrapper,
  buildFilterItem,
  CheckboxTreeFilter,
  IFilterItemBase,
  ICheckboxOptionGroup,
  CheckboxFilter
} from '@komgo/ui-components'
import { getDocumentTypeFilterOptions } from './utils'
import { ReviewStatus } from '../../../review-documents/store/types'
import { sentenceCase } from '../../../../utils/casings'
import { User } from '../../../../store/common/types'

export interface ICounterpartyDocumentFilter {
  categories: Category[]
  types: DocumentType[]
  users: User[]
  filter: CounterpartyDocumentFilter
  disabled?: boolean
  onChange(filter: CounterpartyDocumentFilter): void
}

export class CounterpartyDocsFilter extends React.Component<ICounterpartyDocumentFilter> {
  handleApply = (filter: CounterpartyDocumentFilter) => {
    this.props.onChange(filter)
  }

  handleClear = () => {
    this.props.onChange(null)
  }

  buildFilters(types: ICheckboxOptionGroup[]): Array<IFilterItemBase<CounterpartyDocumentFilter>> {
    const statusesMap = {
      [ReviewStatus.PENDING]: 'awaiting',
      [ReviewStatus.ACCEPTED]: 'approved'
    }
    const statuses = Object.values(ReviewStatus).map((status: string) => ({
      value: status,
      name: sentenceCase(statusesMap[status] || status)
    }))

    const users = this.props.users
      ? this.props.users.map(user => ({ name: `${user.firstName} ${user.lastName}`, value: user.id }))
      : []

    return [
      buildFilterItem(
        'Type',
        'type',
        (filter: CounterpartyDocumentFilter) => filter.type || [],
        props => <CheckboxTreeFilter options={types} {...props} />,
        (filters: string[]) => (filters ? filters.length : 0)
      ),
      buildFilterItem(
        'Review status',
        'reviewStatus',
        (filter: CounterpartyDocumentFilter) => filter.reviewStatus || [],
        props => <CheckboxFilter items={statuses} {...props} />,
        (filters: string[]) => (filters ? filters.length : 0)
      ),
      buildFilterItem(
        'Reviewed by',
        'reviewedBy',
        (filter: CounterpartyDocumentFilter) => filter.reviewedBy || [],
        props => <CheckboxFilter items={users} {...props} />,
        (filters: string[]) => (filters ? filters.length : 0)
      )
    ]
  }

  getTypes() {
    return this.props.categories && this.props.types
      ? getDocumentTypeFilterOptions(this.props.categories, this.props.types)
      : []
  }

  render() {
    const filters = this.buildFilters(this.getTypes())

    return (
      <FilterWrapper
        filters={filters}
        clearedFilters={{ type: [] }}
        appliedFilters={this.props.filter || {}}
        onApply={this.handleApply}
        onClear={this.handleClear}
        disabled={this.props.disabled}
      />
    )
  }
}
