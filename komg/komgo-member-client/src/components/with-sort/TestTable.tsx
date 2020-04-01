import * as React from 'react'
import { Table } from 'semantic-ui-react'

import { ISortableProps } from './withSort'
import { displayDate } from '../../utils/date'

export interface TestItem {
  buyerName: string
  amount: number
  lastUpdated: Date | string
  appetite: boolean
}

interface IProps extends ISortableProps<TestItem> {}

class TestTable extends React.Component<IProps> {
  isSortActive = (currentColumn: string) => {
    return currentColumn === this.props.column ? this.props.direction : null
  }

  render() {
    const { items, handleSort } = this.props
    return (
      <Table basic="very" sortable={true} data-test-id="buyers-risk-cover">
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell
              data-test-id="buyerName"
              onClick={() => handleSort('buyerName')}
              sorted={this.isSortActive('buyerName')}
            >
              Buyer
            </Table.HeaderCell>
            <Table.HeaderCell
              data-test-id="appetite"
              onClick={() => handleSort('appetite')}
              sorted={this.isSortActive('appetite')}
            >
              Appetite
            </Table.HeaderCell>
            <Table.HeaderCell
              data-test-id="amount"
              onClick={() => handleSort('amount')}
              sorted={this.isSortActive('amount')}
              textAlign="right"
            >
              Amount
            </Table.HeaderCell>
            <Table.HeaderCell
              data-test-id="lastUpdated"
              onClick={() => handleSort('lastUpdated')}
              sorted={this.isSortActive('lastUpdated')}
            >
              Last Updated
            </Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {items.map((item, id) => (
            <Table.Row key={id}>
              <Table.Cell textAlign="left">
                <b>{item.buyerName}</b>
              </Table.Cell>
              <Table.Cell>{item.appetite ? 'Yes' : 'No'}</Table.Cell>
              <Table.Cell textAlign="right">{item.amount}</Table.Cell>
              <Table.Cell>{displayDate(item.lastUpdated)}</Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    )
  }
}

export default TestTable
