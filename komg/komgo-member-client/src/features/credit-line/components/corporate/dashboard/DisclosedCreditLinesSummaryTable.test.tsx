import * as React from 'react'
import { shallow } from 'enzyme'
import { Table } from 'semantic-ui-react'
import { Order } from '../../../../../store/common/types'
import { DisclosedCreditLinesSummaryTable } from './DisclosedCreditLinesSummaryTable'
import { CreditLineType } from '../../../store/types'

const fakeDisclosedInfoEnriched = {
  counterpartyStaticId: '123',
  lowestFee: 2,
  availabilityCount: 3,
  appetiteCount: 4,
  _id: '11',
  counterpartyName: 'Test1'
}

describe('DisclosedCreditLineSummaryTable', () => {
  let defaultProps

  beforeEach(() => {
    defaultProps = {
      column: 'counterpartyName',
      direction: Order.Asc,
      items: [fakeDisclosedInfoEnriched],
      handleSort: jest.fn(),
      feature: CreditLineType.RiskCover
    }
  })

  it('should render successfully', () => {
    const wrapper = shallow(<DisclosedCreditLinesSummaryTable {...defaultProps} />)

    expect(wrapper.exists()).toBe(true)
  })

  it('default order should be counterpartyName asc', () => {
    const wrapper = shallow(<DisclosedCreditLinesSummaryTable {...defaultProps} />)

    const headerColumn = wrapper.find('[data-test-id="counterpartyName"]').dive()

    expect(headerColumn.hasClass('ascending sorted')).toBe(true)
  })

  it('should call handleSort when header column is clicked with appropriate data', () => {
    const wrapper = shallow(<DisclosedCreditLinesSummaryTable {...defaultProps} />)

    const headerColumn = wrapper.find('[data-test-id="appetiteCount"]')
    headerColumn.simulate('click')

    expect(defaultProps.handleSort).toHaveBeenCalledWith('appetiteCount')
  })

  it('should have rows', () => {
    const wrapper = shallow(<DisclosedCreditLinesSummaryTable {...defaultProps} />)

    const rows = wrapper.find(Table.Body).find(Table.Row)

    expect(rows.length).toBe(1)
  })

  it('should find first column with name issuing bank if it is bank lines', () => {
    const wrapper = shallow(<DisclosedCreditLinesSummaryTable {...defaultProps} feature={CreditLineType.BankLine} />)

    const headerColumn = wrapper.find('[data-test-id="counterpartyName"]').shallow()

    expect(headerColumn.shallow().text()).toBe('Issuing bank')
  })
})
