import * as React from 'react'
import { shallow } from 'enzyme'
import { Table } from 'semantic-ui-react'

import { Order } from '../../../../../store/common/types'
import { CreditAppetiteDepositLoanFeature, IExtendedDisclosedDepositLoan } from '../../../store/types'
import { DisclosedDepositLoanDetailsTable } from './DisclosedDepositLoanDetailsTable'
import { buildFakeDisclosedDepositLoan } from '@komgo/types'

const fakeDisclosedDepositLoan: IExtendedDisclosedDepositLoan = {
  ...buildFakeDisclosedDepositLoan(),
  companyLocation: 'Paris',
  companyName: 'SC'
}

describe('DisclosedDepositLoanDetailsTable', () => {
  let defaultProps

  beforeEach(() => {
    defaultProps = {
      column: 'companyName',
      direction: Order.Asc,
      items: [fakeDisclosedDepositLoan],
      handleSort: jest.fn(),
      feature: CreditAppetiteDepositLoanFeature.Deposit
    }
  })

  it('should render successfully', () => {
    const wrapper = shallow(<DisclosedDepositLoanDetailsTable {...defaultProps} />)

    expect(wrapper.exists()).toBe(true)
  })

  it('default order should be company name asc', () => {
    const wrapper = shallow(<DisclosedDepositLoanDetailsTable {...defaultProps} />)

    const headerColumn = wrapper.find('[data-test-id="company-name"]').dive()

    expect(headerColumn.hasClass('ascending sorted')).toBe(true)
  })

  it('should call handleSort when header column is clicked with appropriate data', () => {
    const wrapper = shallow(<DisclosedDepositLoanDetailsTable {...defaultProps} />)

    const headerColumn = wrapper.find('[data-test-id="appetite"]')
    headerColumn.simulate('click')

    expect(defaultProps.handleSort).toHaveBeenCalledWith('appetite')
  })

  it('should have rows', () => {
    const wrapper = shallow(<DisclosedDepositLoanDetailsTable {...defaultProps} />)

    const rows = wrapper.find(Table.Body).find(Table.Row)

    expect(rows.length).toBe(1)
  })

  it('isSortActive should return false for column that are not active', () => {
    const wrapper = shallow(<DisclosedDepositLoanDetailsTable {...defaultProps} />)

    const instance = wrapper.instance() as DisclosedDepositLoanDetailsTable

    expect(instance.isSortActive('appetite')).toBe(null)
  })
})
