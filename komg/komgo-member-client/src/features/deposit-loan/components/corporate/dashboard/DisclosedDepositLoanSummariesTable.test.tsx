import * as React from 'react'
import { shallow } from 'enzyme'
import { buildFakeDisclosedDepositLoanSummary } from '@komgo/types'
import { Table } from 'semantic-ui-react'

import { Order } from '../../../../../store/common/types'
import { IExtendedDisclosedDepositLoanSummary, CreditAppetiteDepositLoanFeature } from '../../../store/types'
import { DisclosedDepositLoanSummariesTable } from './DisclosedDepositLoanSummariesTable'

const fakeDisclosedSummaryEnriched: IExtendedDisclosedDepositLoanSummary = {
  ...buildFakeDisclosedDepositLoanSummary(),
  currencyAndTenor: 'USD 3 mounts'
}

describe('DisclosedDepositLoanSummariesTable', () => {
  let defaultProps

  beforeEach(() => {
    defaultProps = {
      column: 'currencyAndTenor',
      direction: Order.Asc,
      items: [fakeDisclosedSummaryEnriched],
      handleSort: jest.fn(),
      feature: CreditAppetiteDepositLoanFeature.Deposit
    }
  })

  it('should render successfully', () => {
    const wrapper = shallow(<DisclosedDepositLoanSummariesTable {...defaultProps} />)

    expect(wrapper.exists()).toBe(true)
  })

  it('default order should be currencyAndTenor asc', () => {
    const wrapper = shallow(<DisclosedDepositLoanSummariesTable {...defaultProps} />)

    const headerColumn = wrapper.find('[data-test-id="currency-and-tenor"]').dive()

    expect(headerColumn.hasClass('ascending sorted')).toBe(true)
  })

  it('should call handleSort when header column is clicked with appropriate data', () => {
    const wrapper = shallow(<DisclosedDepositLoanSummariesTable {...defaultProps} />)

    const headerColumn = wrapper.find('[data-test-id="appetite"]')
    headerColumn.simulate('click')

    expect(defaultProps.handleSort).toHaveBeenCalledWith('appetiteCount')
  })

  it('should have rows', () => {
    const wrapper = shallow(<DisclosedDepositLoanSummariesTable {...defaultProps} />)

    const rows = wrapper.find(Table.Body).find(Table.Row)

    expect(rows.length).toBe(1)
  })

  it('isSortActive should return false for column that are not active', () => {
    const wrapper = shallow(<DisclosedDepositLoanSummariesTable {...defaultProps} />)

    const instance = wrapper.instance() as DisclosedDepositLoanSummariesTable

    expect(instance.isSortActive('appetiteCount')).toBe(null)
  })
})
