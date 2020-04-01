import { buildFilterItem, FilterWrapper, CheckboxTreeFilter, CheckboxFilter } from '@komgo/ui-components'
import React from 'react'
import { Grid } from 'semantic-ui-react'
import styled from 'styled-components'

import { Category, DocumentListFilter, DocumentType } from '../../document-management'
import { Counterparty } from '../../counterparties/store/types'
import { getDocumentTypeFilterOptions } from '../../document-management/components/filter/utils'

interface Props {
  categories: Category[]
  counterparties: Counterparty[]
  types: DocumentType[]
  onFilterChange(filter?: DocumentListFilter): void
}

const buildFilters = (categories: Category[], types: DocumentType[], counterparties: Counterparty[]) => {
  const options = categories && types ? getDocumentTypeFilterOptions(categories, types) : []
  const items = counterparties ? counterparties.map(c => ({ value: c.staticId, name: c.x500Name.CN })) : []
  return [
    buildFilterItem(
      'Type',
      'type',
      (filter: DocumentListFilter) => filter.type || [],
      props => <CheckboxTreeFilter options={options} {...props} />,
      (filters: string[]) => (filters ? filters.length : 0)
    ),
    buildFilterItem(
      'Counterparties',
      'counterparties',
      (filter: DocumentListFilter) => filter.counterparties || [],
      props => <CheckboxFilter {...props} items={items} />,
      (filters: string[]) => (filters ? filters.length : 0)
    )
  ]
}

const TradeDocumentsHeader = ({ onFilterChange, categories, types, counterparties }: Props) => (
  <>
    <StyledGrid>
      <Grid.Row verticalAlign="bottom">
        <Grid.Column width={4}>
          <FilterWrapper
            filters={buildFilters(categories, types, counterparties)}
            clearedFilters={{ type: [], counterparties: [] }}
            appliedFilters={{}}
            onApply={onFilterChange}
            onClear={onFilterChange}
          />
        </Grid.Column>
      </Grid.Row>
    </StyledGrid>
  </>
)

const StyledGrid = styled(Grid)`
  &&& {
    margin-bottom: 1px;
  }
`

export default TradeDocumentsHeader
