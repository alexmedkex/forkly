import * as React from 'react'
import _ from 'lodash'
import { Table } from 'semantic-ui-react'
import withSort, { ISortableProps } from '../../../../../components/with-sort/withSort'
import { IDisclosedCreditLineEnriched, CreditLineType } from '../../../store/types'
import { percentFormat, amountWithCurrencyDisplay, daysFormat } from '../../../utils/formatters'
import { Order } from '../../../../../store/common/types'
import { displayDate } from '../../../../../utils/date'
import {
  MAXIMUM_TENOR_FIELD,
  AVAILABILITY_AMOUNT_FIELD,
  FEE_FIELD,
  MARGIN_FIELD,
  CREDIT_LIMIT_AMOUNT_FIELD
} from '../../../constants'
import { paleGray, white } from '../../../../../styles/colors'
import { dictionary } from '../../../dictionary'
import { toYesNoDash } from '../../../../../utils/casings'
import BasicTable from '../../credit-appetite-shared-components/BasicTable'

interface IProps extends ISortableProps<IDisclosedCreditLineEnriched> {
  highlightBank?: string
  feature: CreditLineType
}

export class DisclosedCreditLinesForCounterpartyTable extends React.Component<IProps> {
  isSortActive = (currentColumn: string) => {
    return currentColumn === this.props.column ? this.props.direction : null
  }

  render() {
    const { items, handleSort, highlightBank, feature } = this.props
    return (
      <BasicTable basic="very" sortable={true} data-test-id="disclosed-credit-lines" columns={9}>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell
              data-test-id="bankName"
              onClick={() => handleSort('companyName')}
              sorted={this.isSortActive('companyName')}
            >
              Bank
            </Table.HeaderCell>
            <Table.HeaderCell
              data-test-id="companyLocation"
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
              data-test-id="availability"
              onClick={() => handleSort('availability')}
              sorted={this.isSortActive('availability')}
            >
              Availability
            </Table.HeaderCell>
            <Table.HeaderCell
              data-test-id="creditLimit"
              onClick={() => handleSort(CREDIT_LIMIT_AMOUNT_FIELD)}
              sorted={this.isSortActive(CREDIT_LIMIT_AMOUNT_FIELD)}
              textAlign="right"
            >
              Credit limit
            </Table.HeaderCell>
            <Table.HeaderCell
              data-test-id="minimumRiskFee"
              onClick={() => handleSort(FEE_FIELD)}
              sorted={this.isSortActive(FEE_FIELD)}
              textAlign="right"
            >
              {dictionary[feature].corporate.details.fee}
            </Table.HeaderCell>
            <Table.HeaderCell
              data-test-id="margin"
              onClick={() => handleSort(MARGIN_FIELD)}
              sorted={this.isSortActive(MARGIN_FIELD)}
              textAlign="right"
            >
              Margin
            </Table.HeaderCell>
            <Table.HeaderCell
              data-test-id="maxTenor"
              onClick={() => handleSort(MAXIMUM_TENOR_FIELD)}
              sorted={this.isSortActive(MAXIMUM_TENOR_FIELD)}
              textAlign="right"
            >
              Tenor (days)
            </Table.HeaderCell>
            <Table.HeaderCell
              data-test-id="updatedAt"
              onClick={() => handleSort('updatedAt')}
              sorted={this.isSortActive('updatedAt')}
              textAlign="right"
            >
              Last Updated
            </Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {items.map((creditLine, id) => (
            <Table.Row
              key={id}
              style={{ background: creditLine.ownerStaticId === highlightBank ? paleGray : white }}
              data-test-id={`disclosed-credit-line-${creditLine.ownerStaticId}`}
            >
              <Table.Cell data-test-id={`company-name-${creditLine.ownerStaticId}`}>
                <b>{creditLine.companyName}</b>
              </Table.Cell>
              <Table.Cell data-test-id={`company-location-${creditLine.ownerStaticId}`}>
                {creditLine.companyLocation}
              </Table.Cell>
              <Table.Cell data-test-id={`appetite-${creditLine.ownerStaticId}`}>
                {toYesNoDash(creditLine.appetite)}
              </Table.Cell>
              <Table.Cell data-test-id={`availability-${creditLine.ownerStaticId}`}>
                {toYesNoDash(creditLine.availability)}
              </Table.Cell>
              <Table.Cell textAlign="right" data-test-id={`credit-limit-${creditLine.ownerStaticId}`}>
                {amountWithCurrencyDisplay(creditLine[CREDIT_LIMIT_AMOUNT_FIELD], creditLine.currency)}
              </Table.Cell>
              <Table.Cell textAlign="right" data-test-id={`fee-${creditLine.ownerStaticId}`}>
                {percentFormat(_.get(creditLine, FEE_FIELD), '-')}
              </Table.Cell>
              <Table.Cell textAlign="right" data-test-id={`margin-${creditLine.ownerStaticId}`}>
                {percentFormat(_.get(creditLine, MARGIN_FIELD), '-')}
              </Table.Cell>
              <Table.Cell textAlign="right" data-test-id={`maximum-tenor-${creditLine.ownerStaticId}`}>
                {daysFormat(_.get(creditLine, MAXIMUM_TENOR_FIELD), '-')}
              </Table.Cell>
              <Table.Cell textAlign="right" data-test-id={`updated-at-${creditLine.ownerStaticId}`}>
                {displayDate(creditLine.updatedAt)}
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
  companyLocation: 'string',
  appetite: 'boolean',
  availability: 'boolean',
  [AVAILABILITY_AMOUNT_FIELD]: 'number',
  [FEE_FIELD]: 'number',
  [MARGIN_FIELD]: 'number',
  [MAXIMUM_TENOR_FIELD]: 'number',
  updatedAt: 'date'
}

export default withSort('companyName', Order.Asc, sortingOption)(DisclosedCreditLinesForCounterpartyTable)
