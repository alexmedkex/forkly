import * as React from 'react'
import { Popup } from 'semantic-ui-react'
import { TruncatedText } from '../../../../../components'
import Text from '../../../../../components/text'
import styled from 'styled-components'
import ActionMenu from './ExtraOptionsMenu'
import { IReceivableDiscountingDashboardTrader } from '../../../../receivable-discounting-legacy/store/types'
import { ReceivablesDiscountingRole } from '../../../../receivable-discounting-legacy/utils/constants'
import PopupTriggerText from '../../../../../components/popup-trigger-text/PopupTriggerText'
import { buildRdMenuProps } from '../../../../receivable-discounting-legacy/utils/selectors'
import { Table, Column } from '@komgo/ui-components'
import { ISortingParams, SortDirection } from '../../../../../store/common/types'
import { Component } from 'react'
import { withRouter, RouteComponentProps } from 'react-router'

export interface IRFDashboardTraderTableProps extends RouteComponentProps<any> {
  data: IReceivableDiscountingDashboardTrader[]
  sort?: ISortingParams
  onSorted?: (params: ISortingParams) => void
}

export class RFDashboardTraderTable extends Component<IRFDashboardTraderTableProps> {
  handleSort({ accessor }: Column<IReceivableDiscountingDashboardTrader>) {
    if (this.props.onSorted) {
      this.props.onSorted({ key: accessor, direction: undefined })
    }
  }

  buildColumns(): Array<Column<IReceivableDiscountingDashboardTrader>> {
    const { key = '', direction = null } = this.props.sort || {}
    const columns: Array<Column<IReceivableDiscountingDashboardTrader>> = [
      {
        title: 'Trade ID',
        accessor: 'tradeId',
        cell: t => <Text bold={true}>{t.tradeId}</Text>
      },
      {
        title: 'Trade Date',
        accessor: 'tradeDate'
      },
      {
        title: 'Counterparty',
        accessor: 'counterparty',
        cell: t => <TruncatedText text={t.counterparty} maxLength={20} />
      },
      {
        title: 'Bank',
        accessor: 'bank',
        cell: t => <TruncatedText text={t.bank} maxLength={20} />
      },
      {
        title: 'Commodity',
        accessor: 'commodity'
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
        data-test-id="rd-trader-dashboard-table"
        data={this.props.data}
        columns={this.buildColumns()}
        onSort={sort => this.handleSort(sort)}
        onRowClick={() => null}
        actionsMenu={row => [
          <ActionMenu
            key={row.rdId}
            tradeTechnicalId={row.tradeTechnicalId!}
            rdMenuProps={buildRdMenuProps(row.rdId, row.rdStatus)}
            role={ReceivablesDiscountingRole.Trader}
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

export default withRouter(RFDashboardTraderTable)
