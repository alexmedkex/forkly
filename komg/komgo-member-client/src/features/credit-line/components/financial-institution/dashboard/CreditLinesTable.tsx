import * as React from 'react'
import { Table } from 'semantic-ui-react'
import _ from 'lodash'

import { IExtendedCreditLine, CreditLineType } from '../../../store/types'
import { displayDate } from '../../../../../utils/date'
import withSort, { ISortableProps } from '../../../../../components/with-sort/withSort'
import { Order } from '../../../../../store/common/types'
import { amountWithCurrencyDisplay, percentFormat, daysFormat } from '../../../utils/formatters'
import {
  CREDIT_LIMIT_AMOUNT_FIELD,
  AVAILABILITY_AMOUNT_FIELD,
  FEE_FIELD,
  MAXIMUM_TENOR_FIELD
} from '../../../constants'
import { dictionary } from '../../../dictionary'
import ActionMenu from '../../credit-appetite-shared-components/ActionMenu'
import { ROUTES } from '../../../routes'
import BasicTable from '../../credit-appetite-shared-components/BasicTable'

interface IProps extends ISortableProps<IExtendedCreditLine> {
  canCrudRiskCover: boolean
  feature: CreditLineType
  handleRemoveCreditLine(riskCover: IExtendedCreditLine): void
}

export class CreditLinesTable extends React.Component<IProps> {
  printOptionalItem(appetite: boolean, item: any, printingItem: any) {
    return appetite && item ? printingItem : '-'
  }

  isSortActive = (currentColumn: string) => {
    return currentColumn === this.props.column ? this.props.direction : null
  }

  render() {
    const { items, handleSort, canCrudRiskCover, handleRemoveCreditLine, feature } = this.props
    return (
      <BasicTable basic="very" sortable={true} data-test-id="buyers-risk-cover" columns={8}>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell
              data-test-id="counterpartyName"
              onClick={() => handleSort('counterpartyName')}
              sorted={this.isSortActive('counterpartyName')}
            >
              {dictionary[feature].financialInstitution.dashboard.counterpartyName}
            </Table.HeaderCell>
            <Table.HeaderCell
              data-test-id="counterpartyLocation"
              onClick={() => handleSort('counterpartyLocation')}
              sorted={this.isSortActive('counterpartyLocation')}
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
              data-test-id="creditLimit"
              onClick={() => handleSort(CREDIT_LIMIT_AMOUNT_FIELD)}
              sorted={this.isSortActive(CREDIT_LIMIT_AMOUNT_FIELD)}
              textAlign="right"
            >
              Credit Limit
            </Table.HeaderCell>
            <Table.HeaderCell
              data-test-id="availability"
              onClick={() => handleSort(AVAILABILITY_AMOUNT_FIELD)}
              sorted={this.isSortActive(AVAILABILITY_AMOUNT_FIELD)}
              textAlign="right"
            >
              Availability
            </Table.HeaderCell>
            <Table.HeaderCell
              data-test-id="minimumRiskFee"
              onClick={() => handleSort(FEE_FIELD)}
              sorted={this.isSortActive(FEE_FIELD)}
              textAlign="right"
            >
              {dictionary[feature].financialInstitution.dashboard.fee}
            </Table.HeaderCell>
            <Table.HeaderCell
              data-test-id="maxTenor"
              onClick={() => handleSort(MAXIMUM_TENOR_FIELD)}
              sorted={this.isSortActive(MAXIMUM_TENOR_FIELD)}
              textAlign="right"
            >
              Max Tenor
            </Table.HeaderCell>
            <Table.HeaderCell
              data-test-id="updatedAt"
              onClick={() => handleSort('updatedAt')}
              sorted={this.isSortActive('updatedAt')}
              textAlign="center"
            >
              Last Updated
            </Table.HeaderCell>
            <Table.HeaderCell textAlign="right" />
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {items.map((creditLine, id) => (
            <Table.Row key={id} data-test-id={`credit-line-${creditLine.counterpartyStaticId}`}>
              <Table.Cell textAlign="left" data-test-id={`counterparty-name-${creditLine.counterpartyStaticId}`}>
                <b>{creditLine.counterpartyName}</b>
              </Table.Cell>
              <Table.Cell textAlign="left" data-test-id={`counterparty-location-${creditLine.counterpartyStaticId}`}>
                {creditLine.counterpartyLocation}
              </Table.Cell>
              <Table.Cell data-test-id={`appetite-${creditLine.counterpartyStaticId}`}>
                {creditLine.appetite ? 'Yes' : 'No'}
              </Table.Cell>
              <Table.Cell textAlign="right" data-test-id={`credit-limit-${creditLine.counterpartyStaticId}`}>
                {this.printOptionalItem(
                  creditLine.appetite,
                  creditLine[CREDIT_LIMIT_AMOUNT_FIELD],
                  amountWithCurrencyDisplay(creditLine[CREDIT_LIMIT_AMOUNT_FIELD], creditLine.currency)
                )}
              </Table.Cell>
              <Table.Cell textAlign="right" data-test-id={`availability-amount-${creditLine.counterpartyStaticId}`}>
                {this.printOptionalItem(
                  creditLine.appetite,
                  creditLine[AVAILABILITY_AMOUNT_FIELD],
                  amountWithCurrencyDisplay(creditLine[AVAILABILITY_AMOUNT_FIELD], creditLine.currency)
                )}
              </Table.Cell>
              <Table.Cell textAlign="right" data-test-id={`fee-${creditLine.counterpartyStaticId}`}>
                {this.printOptionalItem(
                  creditLine.appetite,
                  _.get(creditLine, FEE_FIELD),
                  percentFormat(_.get(creditLine, FEE_FIELD))
                )}
              </Table.Cell>
              <Table.Cell textAlign="right" data-test-id={`maximum-tenor-${creditLine.counterpartyStaticId}`}>
                {daysFormat(_.get(creditLine, MAXIMUM_TENOR_FIELD), '-')}
              </Table.Cell>
              <Table.Cell textAlign="center" data-test-id={`updated-at-${creditLine.counterpartyStaticId}`}>
                {displayDate(creditLine.updatedAt)}
              </Table.Cell>
              <Table.Cell textAlign="right" data-test-id={`actions-${creditLine.counterpartyStaticId}`}>
                <ActionMenu
                  item={creditLine}
                  canCrud={canCrudRiskCover}
                  handleRemove={handleRemoveCreditLine}
                  baseFeatureUrl={ROUTES[feature].financialInstitution.dashboard}
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
  counterpartyName: 'string',
  counterpartyLocation: 'string',
  appetite: 'boolean',
  [CREDIT_LIMIT_AMOUNT_FIELD]: 'number',
  [AVAILABILITY_AMOUNT_FIELD]: 'number',
  [FEE_FIELD]: 'number',
  [MAXIMUM_TENOR_FIELD]: 'number',
  updatedAt: 'date'
}

export default withSort('counterpartyName', Order.Asc, sortingOption)(CreditLinesTable)
