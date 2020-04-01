import * as React from 'react'
import { Table, Label, SemanticCOLORS } from 'semantic-ui-react'
import styled from 'styled-components'
import { Sort } from '../../store/types'

interface Props {
  width?: number
  counterpartiesSort: Sort
  typeCounterTable: TypeCounterTable
  handleSort(column: string, order: string): void
}

export enum TypeCounterTable {
  MANAGEMENT = 1,
  COUNTERPARTY_DOCS = 2
}

const commonHeadersData = [
  {
    // Name of the counterparty
    columnDisplayName: 'Counterparties',
    columnShortName: 'O'
  },
  {
    // Location
    columnDisplayName: 'Location',
    columnShortName: 'L'
  }
]

const CounterpartyManagementHeadersData = [
  {
    // Status
    columnDisplayName: 'Status',
    columnShortName: 'status'
  },
  {
    // Date
    columnDisplayName: 'Date',
    columnShortName: 'timestamp'
  }
]

const CounterpartyDocsHeadersData = [
  {
    // Risk Level
    columnDisplayName: 'Risk level',
    columnShortName: 'risk'
  },
  {
    // Renewal Date
    columnDisplayName: 'Renewal date',
    columnShortName: 'renewal'
  }
]

const concatenateHeaders = (type: TypeCounterTable) => {
  if (type === TypeCounterTable.MANAGEMENT) {
    return commonHeadersData.concat(CounterpartyManagementHeadersData)
  } else if (type === TypeCounterTable.COUNTERPARTY_DOCS) {
    return commonHeadersData.concat(CounterpartyDocsHeadersData)
  }
}

export const ConnectedCountepartiesHeader: React.SFC<Props> = (props: Props) => {
  const headersToDisplay = concatenateHeaders(props.typeCounterTable)
  return (
    <Table.Header>
      <Table.Row>
        {headersToDisplay.map(head => renderColumnHeader(head.columnDisplayName, head.columnShortName, props))}
        <TableHeaderStyled />
      </Table.Row>
    </Table.Header>
  )
}

const renderColumnHeader = (columnDisplayName: string, columnShortName: string, props: Props) => {
  const { width, counterpartiesSort, handleSort } = props
  return (
    <TableHeaderStyled
      key={columnShortName}
      width={width}
      sorted={counterpartiesSort.column === columnShortName ? counterpartiesSort.order : null}
      onClick={() =>
        handleSort(
          columnShortName,
          counterpartiesSort.column === columnShortName && counterpartiesSort.order === 'ascending'
            ? 'descending'
            : 'ascending'
        )
      }
    >
      {columnDisplayName}
    </TableHeaderStyled>
  )
}

export const TableHeaderStyled: any = styled(Table.HeaderCell)`
  &&&&& {
    border-left: none;
    background: white;
  }
`
