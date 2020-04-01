import * as React from 'react'
import { Popup } from 'semantic-ui-react'
import { TruncatedText } from '../../../../../components'
import styled from 'styled-components'
import ExtraOptionsMenu from './ExtraOptionsMenu'
import { IReceivableDiscountingDashboardBank } from '../../../../receivable-discounting-legacy/store/types'
import { ReceivablesDiscountingRole } from '../../../../receivable-discounting-legacy/utils/constants'
import PopupTriggerText from '../../../../../components/popup-trigger-text/PopupTriggerText'
import { buildRdMenuProps } from '../../../../receivable-discounting-legacy/utils/selectors'
import { Component } from 'react'
import { ISortingParams, SortDirection } from '../../../../../store/common/types'
import { Column, Table } from '@komgo/ui-components'
import Text from '../../../../../components/text'
import { RouteComponentProps, withRouter } from 'react-router'

export interface IRFDashboardBankTableProps extends RouteComponentProps<any> {
  data: IReceivableDiscountingDashboardBank[]
  sort?: ISortingParams
  onSorted?: (params: ISortingParams) => void
}

export class RFDashboardBankTable extends Component<IRFDashboardBankTableProps> {
  handleSort({ accessor }: Column<IReceivableDiscountingDashboardBank>) {
    if (this.props.onSorted) {
      this.props.onSorted({ key: accessor, direction: undefined })
    }
  }

  buildColumns(): Array<Column<IReceivableDiscountingDashboardBank>> {
    const { key = '', direction = null } = this.props.sort || {}
    const columns: Array<Column<IReceivableDiscountingDashboardBank>> = [
      {
        title: 'Trade ID',
        accessor: 'tradeId',
        cell: t => <Text bold={true}>{t.tradeId}</Text>
      },
      {
        title: 'Request Date',
        accessor: 'requestDate'
      },
      {
        title: 'Seller',
        accessor: 'seller',
        cell: t => <TruncatedText text={t.seller} maxLength={20} />
      },
      {
        title: 'Counterparty',
        accessor: 'buyer',
        cell: t => <TruncatedText text={t.buyer} maxLength={20} />
      },
      {
        title: 'Invoice amount',
        accessor: 'invoiceAmount',
        cell: t =>
          t.invoiceAmount &&
          t.invoiceType && (
            <Popup
              inverted={true}
              position={'right center'}
              trigger={
                <TriggerTextWrap>
                  {t.currency} {t.invoiceAmount}
                </TriggerTextWrap>
              }
            >
              {t.invoiceType}
            </Popup>
          )
      },
      {
        title: 'Payment Terms',
        accessor: 'paymentTerms'
      },
      {
        title: 'Discounting Date',
        accessor: 'discountingDate'
      },
      {
        title: 'Status',
        accessor: 'status'
      }
    ]

    // apply sorting
    return columns.map(
      c => (c.accessor === key ? { ...c, defaultSortDesc: direction === SortDirection.Descending } : c)
    )
  }

  render() {
    return (
      <Table
        data-test-id="rd-bank-dashboard-table"
        data={this.props.data}
        columns={this.buildColumns()}
        onSort={sort => this.handleSort(sort)}
        onRowClick={() => null}
        actionsMenu={row => [
          <ExtraOptionsMenu
            key={row.rd.staticId}
            rdMenuProps={buildRdMenuProps(row.rd.staticId, row.rd.status)}
            role={ReceivablesDiscountingRole.Bank}
          />
        ]}
        dataTestId="tradeId"
      />
    )
  }
}

const TriggerTextWrap = styled(PopupTriggerText)`
  margin: 4px 0;
  display: inline-block;
`

export default withRouter(RFDashboardBankTable)
