jest.mock('./ExtraOptionsMenu', () => () => 'ExtraOptionsMenu')

import * as React from 'react'
import { mount } from 'enzyme'
import * as renderer from 'react-test-renderer'
import { MemoryRouter as Router } from 'react-router'

import { Popup } from 'semantic-ui-react'
import { IReceivableDiscountingDashboardTrader } from '../../../../receivable-discounting-legacy/store/types'
import { fakeReceivableDiscountingDashboardTrader } from '../../../../receivable-discounting-legacy/utils/faker'
import RFDashboardTraderTable, { IRFDashboardTraderTableProps } from './RFDashboardTraderTable'
import { Table, TableProps } from '@komgo/ui-components'
import { SortDirection } from '../../../../../store/common/types'

const data: IReceivableDiscountingDashboardTrader[] = [
  fakeReceivableDiscountingDashboardTrader({
    tradeId: 'TRADE-ID-1',
    tradeTechnicalId: 'TRADE-TECHNICAL-ID-1',
    rdId: 'RD-ID-1',
    status: 'To be discounted'
  }),
  fakeReceivableDiscountingDashboardTrader({
    tradeId: 'TRADE-ID-2',
    tradeTechnicalId: 'TRADE-TECHNICAL-ID-2',
    rdId: 'RD-ID-2',
    status: 'Requested'
  }),
  {
    ...fakeReceivableDiscountingDashboardTrader({
      tradeId: 'TRADE-ID-3',
      tradeTechnicalId: 'TRADE-TECHNICAL-ID-3',
      rdId: 'RD-ID-3',
      status: 'Requested'
    }),
    invoiceAmount: undefined,
    invoiceType: undefined
  }
]

const testProps: IRFDashboardTraderTableProps = {
  data
} as IRFDashboardTraderTableProps

describe('RFDashboardTraderTable', () => {
  it('renders correctly', () => {
    expect(
      renderer
        .create(
          <Router>
            <RFDashboardTraderTable {...testProps} />
          </Router>
        )
        .toJSON()
    ).toMatchSnapshot()
  })

  it('shows 3 rows', () => {
    const wrapper = mount(
      <Router>
        <RFDashboardTraderTable {...testProps} />
      </Router>
    )

    const rdTraderDasbhaordTableRows = wrapper.find('.rt-tbody [role="row"]')

    expect(rdTraderDasbhaordTableRows.length === 3)
  })

  it('has 3 items', () => {
    const wrapper = mount(
      <Router>
        <RFDashboardTraderTable {...testProps} />
      </Router>
    )

    const tableProps = wrapper.find(Table).props() as TableProps<IReceivableDiscountingDashboardTrader>

    expect(tableProps.data.length === 3)
  })

  it('renders popup for invoiceType', () => {
    const wrapper = mount(
      <Router>
        <RFDashboardTraderTable {...testProps} />
      </Router>
    )

    const invoiceAmountCell = wrapper.find({ 'data-test-id': 'TRADE-ID-1-invoiceAmount' })
    const popup = invoiceAmountCell.find(Popup)

    expect(popup.exists()).toBeTruthy()
  })

  it('no popup for invoiceType if undefined values provided', () => {
    const wrapper = mount(
      <Router>
        <RFDashboardTraderTable {...testProps} />
      </Router>
    )

    const invoiceAmountCell = wrapper.find({ 'data-test-id': 'TRADE-ID-3-invoiceAmount' })
    const popup = invoiceAmountCell.find(Popup)

    expect(popup.exists()).toBeFalsy()
  })

  it('should sort by passed sort data', () => {
    const props = { ...testProps, sort: { key: 'tradeDate', direction: SortDirection.Ascending } }
    const wrapper = mount(
      <Router>
        <RFDashboardTraderTable {...props} />
      </Router>
    )

    const tableProps = wrapper.find(Table).props() as TableProps<IReceivableDiscountingDashboardTrader>

    const sortedColumn = tableProps.columns.find(c => c.defaultSortDesc === false)

    expect(sortedColumn.accessor).toBe('tradeDate')
  })
})
