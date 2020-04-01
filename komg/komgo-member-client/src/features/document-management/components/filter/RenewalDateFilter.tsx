import styled from 'styled-components'
import { FilterItem } from './FilterItem'
import * as React from 'react'

import { renewalDateFilterOptions } from '../../utils/filters'

export interface IRenewalDateFilterProps {
  count: Array<{
    key: string
    value: number
  }>
  activeKey: string
  onFilter: (key) => void
}

export interface ItemProps {
  active?: boolean
}

export const RenewalDateFilter: React.FC<IRenewalDateFilterProps> = (props: IRenewalDateFilterProps) => {
  const filterItems = renewalDateFilterOptions.map(filter => {
    const count = props.count ? props.count.find(c => c.key === filter.key) : null

    return {
      title: filter.title,
      filterKey: filter.key,
      count: count ? count.value.toString() : ''
    }
  })

  return (
    <Wrapper>
      {filterItems.map(filter => (
        <FilterItem
          data-test-id={`renewal-date-filter-${filter.filterKey}`}
          key={filter.filterKey}
          {...filter}
          onFilter={props.onFilter}
          activeKey={props.activeKey}
        />
      ))}
    </Wrapper>
  )
}

export const Wrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 30px;
`
