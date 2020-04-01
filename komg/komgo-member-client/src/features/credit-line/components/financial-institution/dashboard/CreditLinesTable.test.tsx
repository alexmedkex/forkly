import * as React from 'react'
import { shallow } from 'enzyme'
import { Table } from 'semantic-ui-react'

import { CreditLinesTable } from './CreditLinesTable'
import { Order } from '../../../../../store/common/types'
import { buildFakeRiskCover } from '@komgo/types'
import { CreditLineType } from '../../../store/types'

describe('BuyersRiskCoverTable', () => {
  let defaultProps

  beforeEach(() => {
    defaultProps = {
      column: 'counterpartyName',
      direction: Order.Asc,
      items: [buildFakeRiskCover()],
      handleSort: jest.fn(),
      canCrudRiskCover: true,
      handleRemoveRiskCover: jest.fn(),
      feature: CreditLineType.RiskCover
    }
  })

  it('should render successfully', () => {
    const wrapper = shallow(<CreditLinesTable {...defaultProps} />)

    expect(wrapper.exists()).toBe(true)
  })

  it('default order should be counterpartyName asc', () => {
    const wrapper = shallow(<CreditLinesTable {...defaultProps} />)

    const headerColumn = wrapper.find('[data-test-id="counterpartyName"]').dive()

    expect(headerColumn.hasClass('ascending sorted')).toBe(true)
  })

  it('should call handleSort when header column is clicked with appropriate data', () => {
    const wrapper = shallow(<CreditLinesTable {...defaultProps} />)

    const headerColumn = wrapper.find('[data-test-id="appetite"]')
    headerColumn.simulate('click')

    expect(defaultProps.handleSort).toHaveBeenCalledWith('appetite')
  })

  it('should have rows', () => {
    const wrapper = shallow(<CreditLinesTable {...defaultProps} />)

    const rows = wrapper.find(Table.Body).find(Table.Row)

    expect(rows.length).toBe(1)
  })
})
