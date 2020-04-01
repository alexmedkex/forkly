jest.mock('./ExtraOptionsMenu', () => () => 'ExtraOptionsMenu')

import * as React from 'react'
import { mount } from 'enzyme'
import * as renderer from 'react-test-renderer'
import { MemoryRouter as Router } from 'react-router'

import { Popup } from 'semantic-ui-react'
import { IReceivableDiscountingDashboardBank } from '../../../../receivable-discounting-legacy/store/types'
import { fakeReceivableDiscountingDashboardBank } from '../../../../receivable-discounting-legacy/utils/faker'
import RFDashboardBankTable, { IRFDashboardBankTableProps } from './RFDashboardBankTable'
import { TableProps, Table } from '@komgo/ui-components'
import { SortDirection } from '../../../../../store/common/types'

const data: IReceivableDiscountingDashboardBank[] = [
  fakeReceivableDiscountingDashboardBank({
    tradeId: 'TRADE-1'
  }),
  fakeReceivableDiscountingDashboardBank({
    tradeId: 'TRADE-2'
  })
]
const testProps: IRFDashboardBankTableProps = { data } as IRFDashboardBankTableProps

describe('RFDashboardBankTable', () => {
  it('renders correctly', () => {
    expect(
      renderer
        .create(
          <Router>
            <RFDashboardBankTable {...testProps} />
          </Router>
        )
        .toJSON()
    ).toMatchSnapshot()
  })

  it('shows 3 rows', () => {
    const wrapper = mount(
      <Router>
        <RFDashboardBankTable {...testProps} />
      </Router>
    )

    const rdTraderDasbhaordTableRows = wrapper.find('.rt-tbody [role="row"]')

    expect(rdTraderDasbhaordTableRows.length === 3)
  })

  it('has 3 items', () => {
    const wrapper = mount(
      <Router>
        <RFDashboardBankTable {...testProps} />
      </Router>
    )

    const tableProps = wrapper.find(Table).props() as TableProps<IRFDashboardBankTableProps>

    expect(tableProps.data.length === 3)
  })

  it('renders popup for invoiceType', () => {
    const wrapper = mount(
      <Router>
        <RFDashboardBankTable {...testProps} />
      </Router>
    )

    const invoiceAmountCell = wrapper.find({ 'data-test-id': data[0].tradeId })
    const popup = invoiceAmountCell.find(Popup)

    expect(popup.exists()).toBeTruthy()
  })

  it('no popup for invoiceType if undefined values provided', () => {
    const props = {
      data: [
        {
          ...testProps.data[0],
          invoiceAmount: undefined,
          invoiceType: undefined
        }
      ]
    }
    const wrapper = mount(
      <Router>
        <RFDashboardBankTable {...props} />
      </Router>
    )

    const invoiceAmountCell = wrapper.find({ 'data-test-id': data[0].tradeId })
    const popup = invoiceAmountCell.find(Popup)

    expect(popup.exists()).toBeFalsy()
  })

  it('should sort by passed sort data', () => {
    const key = 'requestDate'
    const props = { ...testProps, sort: { key, direction: SortDirection.Ascending } }
    const wrapper = mount(
      <Router>
        <RFDashboardBankTable {...props} />
      </Router>
    )

    const tableProps = wrapper.find(Table).props() as TableProps<IRFDashboardBankTableProps>

    const sortedColumn = tableProps.columns.find(c => c.defaultSortDesc === false)

    expect(sortedColumn.accessor).toBe(key)
  })
})
