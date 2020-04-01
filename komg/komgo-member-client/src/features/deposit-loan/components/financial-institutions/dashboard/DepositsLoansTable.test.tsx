import * as React from 'react'
import { shallow } from 'enzyme'
import { Table } from 'semantic-ui-react'
import { buildFakeDepositLoan } from '@komgo/types'

import { DepositsLoansTable } from './DepositsLoansTable'
import { Order } from '../../../../../store/common/types'
import { CreditAppetiteDepositLoanFeature } from '../../../store/types'

describe('BuyersRiskCoverTable', () => {
  let defaultProps

  beforeEach(() => {
    defaultProps = {
      column: 'currencyAndTenor',
      direction: Order.Asc,
      items: [buildFakeDepositLoan()],
      handleSort: jest.fn(),
      canCrudRiskCover: true,
      handleRemoveRiskCover: jest.fn(),
      feature: CreditAppetiteDepositLoanFeature.Deposit
    }
  })

  it('should render successfully', () => {
    const wrapper = shallow(<DepositsLoansTable {...defaultProps} />)

    expect(wrapper.exists()).toBe(true)
  })

  it('default order should be currency-and-tenor asc', () => {
    const wrapper = shallow(<DepositsLoansTable {...defaultProps} />)

    const headerColumn = wrapper.find('[data-test-id="currency-and-tenor"]').dive()

    expect(headerColumn.hasClass('ascending sorted')).toBe(true)
  })

  it('should call handleSort when header column is clicked with appropriate data', () => {
    const wrapper = shallow(<DepositsLoansTable {...defaultProps} />)

    const headerColumn = wrapper.find('[data-test-id="appetite"]')
    headerColumn.simulate('click')

    expect(defaultProps.handleSort).toHaveBeenCalledWith('appetite')
  })

  it('should have 1 row', () => {
    const wrapper = shallow(<DepositsLoansTable {...defaultProps} />)

    const rows = wrapper.find(Table.Body).find(Table.Row)

    expect(rows.length).toBe(1)
  })
})
