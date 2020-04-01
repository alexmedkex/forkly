import * as React from 'react'
import { Link } from 'react-router-dom'
import { Table } from 'semantic-ui-react'

import withSort, { ISortableProps } from '../../../../../components/with-sort/withSort'
import { Order } from '../../../../../store/common/types'
import { percentFormat } from '../../../../credit-line/utils/formatters'
import { IExtendedDisclosedDepositLoanSummary, CreditAppetiteDepositLoanFeature } from '../../../store/types'
import { displayDate } from '../../../../../utils/date'
import { ROUTES } from '../../../routes'
import { createCurrencyAndPeriodStringValue } from '../../../utils/formatters'
import BasicTable from '../../../../credit-line/components/credit-appetite-shared-components/BasicTable'

interface IProps extends ISortableProps<IExtendedDisclosedDepositLoanSummary> {
  feature: CreditAppetiteDepositLoanFeature
}

export class DisclosedDepositLoanSummariesTable extends React.Component<IProps> {
  isSortActive = (currentColumn: string) => {
    return currentColumn === this.props.column ? this.props.direction : null
  }

  render() {
    const { items, handleSort, feature } = this.props
    return (
      <BasicTable basic="very" sortable={true} data-test-id={`${feature}-summaries-table`}>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell
              data-test-id="currency-and-tenor"
              onClick={() => handleSort('currencyAndTenor')}
              sorted={this.isSortActive('currencyAndTenor')}
              width={5}
            >
              Currency and tenor
            </Table.HeaderCell>
            <Table.HeaderCell
              data-test-id="appetite"
              onClick={() => handleSort('appetiteCount')}
              sorted={this.isSortActive('appetiteCount')}
              width={3}
            >
              Appetite
            </Table.HeaderCell>
            <Table.HeaderCell
              data-test-id="lowest-pricing"
              textAlign="right"
              onClick={() => handleSort('lowestPricing')}
              sorted={this.isSortActive('lowestPricing')}
              width={2}
            >
              Lowest pricing per annum
            </Table.HeaderCell>
            <Table.HeaderCell
              data-test-id="last-updated"
              onClick={() => handleSort('lastUpdated')}
              sorted={this.isSortActive('lastUpdated')}
              textAlign="center"
            >
              Last updated
            </Table.HeaderCell>
            <Table.HeaderCell style={{ width: '140px' }} />
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {items.map((summary, id) => (
            <Table.Row key={id} data-test-id={`summary-${summary.currencyAndTenor}`}>
              <Table.Cell data-test-id={`currency-and-tenor-${summary.currencyAndTenor}`}>
                <b>{summary.currencyAndTenor}</b>
              </Table.Cell>
              <Table.Cell data-test-id={`appetite-${summary.currencyAndTenor}`}>
                {summary.appetiteCount !== 0 ? (
                  <span>
                    Yes <small className="grey">({summary.appetiteCount})</small>
                  </span>
                ) : (
                  <span>No</span>
                )}
              </Table.Cell>
              <Table.Cell textAlign="right" data-test-id={`lowest-pricing-${summary.currencyAndTenor}`}>
                {percentFormat(summary.lowestPricing, '-')}
              </Table.Cell>
              <Table.Cell data-test-id={`fee-${summary.currencyAndTenor}`} textAlign="center">
                {displayDate(summary.lastUpdated)}
              </Table.Cell>
              <Table.Cell
                textAlign="right"
                data-test-id={`actions-${summary.currencyAndTenor}`}
                style={{ width: '140' }}
              >
                <Link
                  to={`${ROUTES[feature].corporate.dashboard}/currency-tenor/${createCurrencyAndPeriodStringValue(
                    summary
                  )}`}
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
  currencyAndTenor: 'string',
  appetiteCount: 'string',
  lowestPricing: 'number',
  lastUpdated: 'date'
}

export default withSort('currencyAndTenor', Order.Asc, sortingOption)(DisclosedDepositLoanSummariesTable)
