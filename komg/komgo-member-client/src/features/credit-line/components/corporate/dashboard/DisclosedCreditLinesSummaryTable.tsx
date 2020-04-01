import * as React from 'react'
import { Link } from 'react-router-dom'
import { Table } from 'semantic-ui-react'
import withSort, { ISortableProps } from '../../../../../components/with-sort/withSort'
import { IDisclosedCreditLineSummaryEnriched, CreditLineType } from '../../../store/types'
import { percentFormat } from '../../../utils/formatters'
import { Order } from '../../../../../store/common/types'
import { dictionary } from '../../../dictionary'
import BasicTable from '../../credit-appetite-shared-components/BasicTable'

interface IProps extends ISortableProps<IDisclosedCreditLineSummaryEnriched> {
  feature: CreditLineType
}

export class DisclosedCreditLinesSummaryTable extends React.Component<IProps> {
  isSortActive = (currentColumn: string) => {
    return currentColumn === this.props.column ? this.props.direction : null
  }

  render() {
    const { items, handleSort, feature } = this.props
    return (
      <BasicTable basic="very" sortable={true} data-test-id="disclosed-credit-lines" columns={6}>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell
              data-test-id="counterpartyName"
              onClick={() => handleSort('counterpartyName')}
              sorted={this.isSortActive('counterpartyName')}
            >
              {dictionary[feature].corporate.dashboard.counterpartyName}
            </Table.HeaderCell>
            <Table.HeaderCell
              data-test-id="counterpartyLocation"
              onClick={() => handleSort('counterpartyLocation')}
              sorted={this.isSortActive('counterpartyLocation')}
            >
              Location
            </Table.HeaderCell>
            <Table.HeaderCell
              data-test-id="appetiteCount"
              onClick={() => handleSort('appetiteCount')}
              sorted={this.isSortActive('appetiteCount')}
            >
              Appetite
            </Table.HeaderCell>
            <Table.HeaderCell
              data-test-id="availabilityCount"
              onClick={() => handleSort('availabilityCount')}
              sorted={this.isSortActive('availabilityCount')}
            >
              Availability
            </Table.HeaderCell>
            <Table.HeaderCell
              data-test-id="lowestRiskFee"
              onClick={() => handleSort('lowestRiskFee')}
              sorted={this.isSortActive('lowestRiskFee')}
              textAlign="right"
            >
              {dictionary[feature].corporate.dashboard.lowestFee}
            </Table.HeaderCell>
            <Table.HeaderCell />
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {items.map((summary, id) => (
            <Table.Row key={id} data-test-id={`summary-${summary.counterpartyStaticId}`}>
              <Table.Cell data-test-id={`counterparty-name-${summary.counterpartyStaticId}`}>
                <b>{summary.counterpartyName}</b>
              </Table.Cell>
              <Table.Cell data-test-id={`counterparty-location-${summary.counterpartyStaticId}`}>
                {summary.counterpartyLocation}
              </Table.Cell>
              <Table.Cell data-test-id={`appetite-${summary.counterpartyStaticId}`}>
                {summary.appetiteCount !== 0 ? (
                  <span>
                    Yes <small className="grey">({summary.appetiteCount})</small>
                  </span>
                ) : (
                  <span>No</span>
                )}
              </Table.Cell>
              <Table.Cell data-test-id={`availaibility-${summary.counterpartyStaticId}`}>
                {summary.availabilityCount !== 0 ? (
                  <span>
                    Yes <small className="grey">({summary.availabilityCount})</small>
                  </span>
                ) : (
                  <span>No</span>
                )}
              </Table.Cell>
              <Table.Cell textAlign="right" data-test-id={`fee-${summary.counterpartyStaticId}`}>
                {percentFormat(summary.lowestFee, '-')}
              </Table.Cell>
              <Table.Cell textAlign="right" data-test-id={`actions-${summary.counterpartyStaticId}`}>
                <Link
                  to={`${feature === CreditLineType.RiskCover ? '/risk-cover/buyers/' : '/bank-lines/banks/'}${
                    summary.counterpartyStaticId
                  }`}
                  className="ui button"
                >
                  View details
                </Link>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </BasicTable>
    )
  }
}
const sortingOption = {
  counterpartyName: 'string',
  counterpartyLocation: 'string',
  appetiteCount: 'number',
  availabilityCount: 'number',
  lowestFee: 'number'
}

export default withSort('counterpartyName', Order.Asc, sortingOption)(DisclosedCreditLinesSummaryTable)
