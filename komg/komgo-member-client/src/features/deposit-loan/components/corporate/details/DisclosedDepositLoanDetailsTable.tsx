import * as React from 'react'
import { Table } from 'semantic-ui-react'

import withSort, { ISortableProps } from '../../../../../components/with-sort/withSort'
import { Order } from '../../../../../store/common/types'
import { percentFormat } from '../../../../credit-line/utils/formatters'
import { CreditAppetiteDepositLoanFeature, IExtendedDisclosedDepositLoan } from '../../../store/types'
import { displayDate } from '../../../../../utils/date'
import { paleGray, white } from '../../../../../styles/colors'
import BasicTable from '../../../../credit-line/components/credit-appetite-shared-components/BasicTable'
import { toYesNoDash } from '../../../../../utils/casings'

interface IProps extends ISortableProps<IExtendedDisclosedDepositLoan> {
  feature: CreditAppetiteDepositLoanFeature
  highlightItem?: string
}

export class DisclosedDepositLoanDetailsTable extends React.Component<IProps> {
  isSortActive = (currentColumn: string) => {
    return currentColumn === this.props.column ? this.props.direction : null
  }

  render() {
    const { items, handleSort, feature, highlightItem } = this.props
    return (
      <BasicTable basic="very" sortable={true} data-test-id={`${feature}-table`}>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell
              data-test-id="company-name"
              onClick={() => handleSort('companyName')}
              sorted={this.isSortActive('companyName')}
            >
              Bank
            </Table.HeaderCell>
            <Table.HeaderCell
              data-test-id="company-location"
              onClick={() => handleSort('companyLocation')}
              sorted={this.isSortActive('companyLocation')}
            >
              Location
            </Table.HeaderCell>
            <Table.HeaderCell
              data-test-id="appetite"
              onClick={() => handleSort('appetite')}
              sorted={this.isSortActive('appetite')}
            >
              Appetite
            </Table.HeaderCell>
            <Table.HeaderCell
              data-test-id="pricing"
              textAlign="right"
              onClick={() => handleSort('pricing')}
              sorted={this.isSortActive('pricing')}
            >
              Pricing per annum
            </Table.HeaderCell>
            <Table.HeaderCell
              data-test-id="last-updated"
              onClick={() => handleSort('lastUpdated')}
              sorted={this.isSortActive('lastUpdated')}
              textAlign="center"
            >
              Last updated
            </Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {items.map((item, id) => (
            <Table.Row
              key={id}
              data-test-id={`deposit-loan-${item.ownerStaticId}`}
              style={{ background: item.ownerStaticId === highlightItem && highlightItem ? paleGray : white }}
            >
              <Table.Cell data-test-id={`company-name-${item.companyName}`}>
                <b>{item.companyName}</b>
              </Table.Cell>
              <Table.Cell data-test-id={`company-location-${item.companyName}`}>{item.companyLocation}</Table.Cell>
              <Table.Cell data-test-id={`appetite-${item.ownerStaticId}`}>
                <span>{toYesNoDash(item.appetite)}</span>
              </Table.Cell>
              <Table.Cell textAlign="right" data-test-id={`pricing-${item.ownerStaticId}`}>
                {percentFormat(item.pricing, '-')}
              </Table.Cell>
              <Table.Cell textAlign="center" data-test-id={`actions-${item.ownerStaticId}`}>
                {displayDate(item.updatedAt)}
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </BasicTable>
    )
  }
}
const sortingOption = {
  companyName: 'string',
  location: 'string',
  appetite: 'boolean',
  pricing: 'number',
  updatedAt: 'date'
}

export default withSort('companyName', Order.Asc, sortingOption)(DisclosedDepositLoanDetailsTable)
