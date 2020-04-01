import * as React from 'react'
import { Table } from 'semantic-ui-react'
import _ from 'lodash'

import { displayDate } from '../../../../../utils/date'
import ActionMenu from '../../../../credit-line/components/credit-appetite-shared-components/ActionMenu'
import withSort, { ISortableProps } from '../../../../../components/with-sort/withSort'
import { Order } from '../../../../../store/common/types'
import { CreditAppetiteDepositLoanFeature, IExtendedDepositLoanResponse } from '../../../store/types'
import { percentFormat } from '../../../../credit-line/utils/formatters'
import { ROUTES } from '../../../routes'
import BasicTable from '../../../../credit-line/components/credit-appetite-shared-components/BasicTable'

interface IProps extends ISortableProps<IExtendedDepositLoanResponse> {
  canCrudCreditAppetite: boolean
  feature: CreditAppetiteDepositLoanFeature
  handleRemoveDepositLoan(riskCover: IExtendedDepositLoanResponse): void
}

export class DepositsLoansTable extends React.Component<IProps> {
  isSortActive(currentColumn: string) {
    return currentColumn === this.props.column ? this.props.direction : null
  }

  render() {
    const { items, handleSort, canCrudCreditAppetite, handleRemoveDepositLoan, feature } = this.props
    return (
      <BasicTable basic="very" sortable={true} data-test-id={`${feature}-table`}>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell
              data-test-id="currency-and-tenor"
              onClick={() => handleSort('currencyAndTenor')}
              sorted={this.isSortActive('currencyAndTenor')}
              width={6}
            >
              Currency and tenor
            </Table.HeaderCell>
            <Table.HeaderCell
              data-test-id="appetite"
              onClick={() => handleSort('appetite')}
              sorted={this.isSortActive('appetite')}
              width={2}
            >
              Appetite
            </Table.HeaderCell>
            <Table.HeaderCell
              data-test-id="pricing"
              onClick={() => handleSort('pricing')}
              sorted={this.isSortActive('pricing')}
              textAlign="right"
              width={4}
            >
              Pricing per annum
            </Table.HeaderCell>
            <Table.HeaderCell
              data-test-id="updatedAt"
              onClick={() => handleSort('updatedAt')}
              sorted={this.isSortActive('updatedAt')}
              textAlign="center"
            >
              Last Updated
            </Table.HeaderCell>
            <Table.HeaderCell textAlign="right" width={1} />
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {items.map((item, id) => (
            <Table.Row key={id} data-test-id={`${feature}-item-${item.currencyAndTenor}`}>
              <Table.Cell textAlign="left" data-test-id={`${feature}-item-currency-and-tenor-${item.currencyAndTenor}`}>
                <b>{item.currencyAndTenor}</b>
              </Table.Cell>
              <Table.Cell textAlign="left" data-test-id={`${feature}-item-appetite-${item.currencyAndTenor}`}>
                {item.appetite ? 'Yes' : 'No'}
              </Table.Cell>
              <Table.Cell textAlign="right" data-test-id={`${feature}-item-pricing-${item.currencyAndTenor}`}>
                {percentFormat(item.pricing, '-')}
              </Table.Cell>
              <Table.Cell textAlign="center" data-test-id={`${feature}-item-last-updated-$${item.currencyAndTenor}`}>
                {displayDate(item.updatedAt)}
              </Table.Cell>
              <Table.Cell textAlign="right" data-test-id={`${feature}-item-actions-${item.currencyAndTenor}`}>
                <ActionMenu
                  item={item}
                  canCrud={canCrudCreditAppetite}
                  baseFeatureUrl={ROUTES[feature].financialInstitution.dashboard}
                  handleRemove={handleRemoveDepositLoan}
                />
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
  appetite: 'boolean',
  pricing: 'number',
  updatedAt: 'date'
}

export default withSort('currencyAndTenor', Order.Asc, sortingOption)(DepositsLoansTable)
