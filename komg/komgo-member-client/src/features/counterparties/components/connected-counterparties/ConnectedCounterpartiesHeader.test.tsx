import * as React from 'react'
import { shallow } from 'enzyme'
import { ConnectedCountepartiesHeader, TypeCounterTable } from './ConnectedCounterpartiesHeader'
import { Sort } from '../../store/types'
import { Table } from 'semantic-ui-react'
import { TableHeaderStyled } from './ConnectedCounterpartiesHeader'

describe('ConnectedCounterpartiesHeader component', () => {
  let defaultProps: any
  let defaultPropsManagement: any

  beforeEach(() => {
    const sort: Sort = {
      column: 'aaaa',
      order: 'ascending'
    }
    defaultProps = {
      width: 16,
      counterpartiesSort: sort,
      typeCounterTable: TypeCounterTable.COUNTERPARTY_DOCS,
      handleSort: jest.fn()
    }
    defaultPropsManagement = {
      width: 16,
      counterpartiesSort: sort,
      typeCounterTable: TypeCounterTable.MANAGEMENT,
      handleSort: jest.fn()
    }
  })

  it('should render ConnectedCountepartiesHeader component successfully', () => {
    const wrapper = shallow(<ConnectedCountepartiesHeader {...defaultProps} />)

    expect(wrapper.exists()).toBe(true)
  })

  it('The header shows the correct number of columns when its a COUNTERPARTY_DOCS', () => {
    const wrapper = shallow(<ConnectedCountepartiesHeader {...defaultProps} />)

    const numRows = wrapper.find(Table.Row).shallow().length
    expect(numRows).toBe(1)

    const numHeaders = wrapper.find(TableHeaderStyled).length
    expect(numHeaders).toBe(5) // 4 columns + the ellipsis button
  })

  it('The header shows the correct number of columns when its a MANAGEMENT', () => {
    const wrapper = shallow(<ConnectedCountepartiesHeader {...defaultPropsManagement} />)

    const numRows = wrapper.find(Table.Row).shallow().length
    expect(numRows).toBe(1)

    const numHeaders = wrapper.find(TableHeaderStyled).length
    expect(numHeaders).toBe(5) // 4 columns + the ellipsis button
  })
})
