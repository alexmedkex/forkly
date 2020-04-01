import * as React from 'react'
import { shallow } from 'enzyme'
import { buildFakeCreditLine } from '@komgo/types'
import { Table } from 'semantic-ui-react'
import { Order } from '../../../../../store/common/types'
import { DisclosedCreditLinesForCounterpartyTable } from './DisclosedCreditLinesForCounterpartyTable'
import { paleGray, white } from '../../../../../styles/colors'
import { CreditLineType } from '../../../store/types'

describe('DisclosedCreditLinesForBuyerTable', () => {
  let defaultProps

  beforeEach(() => {
    defaultProps = {
      column: 'companyName',
      direction: Order.Asc,
      items: [{ ...buildFakeCreditLine(), ownerStaticId: '123' }],
      handleSort: jest.fn(),
      feature: CreditLineType.RiskCover
    }
  })

  it('should render successfully', () => {
    const wrapper = shallow(<DisclosedCreditLinesForCounterpartyTable {...defaultProps} />)

    expect(wrapper.exists()).toBe(true)
  })

  it('default order should be bankName asc', () => {
    const wrapper = shallow(<DisclosedCreditLinesForCounterpartyTable {...defaultProps} />)

    const headerColumn = wrapper.find('[data-test-id="bankName"]').dive()

    expect(headerColumn.hasClass('ascending sorted')).toBe(true)
  })

  it('should call handleSort when header column is clicked with appropriate data', () => {
    const wrapper = shallow(<DisclosedCreditLinesForCounterpartyTable {...defaultProps} />)

    const headerColumn = wrapper.find('[data-test-id="appetite"]')
    headerColumn.simulate('click')

    expect(defaultProps.handleSort).toHaveBeenCalledWith('appetite')
  })

  it('should have one row', () => {
    const wrapper = shallow(<DisclosedCreditLinesForCounterpartyTable {...defaultProps} />)

    const rows = wrapper.find(Table.Body).find(Table.Row)

    expect(rows.length).toBe(1)
  })
  it('row should be highlighted', () => {
    const wrapper = shallow(<DisclosedCreditLinesForCounterpartyTable {...defaultProps} highlightBank="123" />)

    const row = wrapper
      .find(Table.Body)
      .find(Table.Row)
      .first()

    expect(row.prop('style')).toEqual({ background: paleGray })
  })
  it('row should not be highlighted', () => {
    const wrapper = shallow(<DisclosedCreditLinesForCounterpartyTable {...defaultProps} highlightBank="1234" />)

    const row = wrapper
      .find(Table.Body)
      .find(Table.Row)
      .first()

    expect(row.prop('style')).toEqual({ background: white })
  })
})
