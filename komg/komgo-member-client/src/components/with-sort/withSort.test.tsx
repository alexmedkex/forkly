jest.mock('./sorting', () => ({
  sortPerString: jest.fn(() => mockItems),
  sortPerNumber: jest.fn(),
  sortPerBoolean: jest.fn(),
  sortPerDate: jest.fn()
}))
import * as React from 'react'
import { shallow } from 'enzyme'
import withSort from './withSort'
import { Order } from '../../store/common/types'
import { sortPerString, sortPerNumber, sortPerDate, sortPerBoolean } from './sorting'
import TestTable, { TestItem } from './TestTable'

const mockItems: TestItem[] = [
  {
    buyerName: 'ATest',
    amount: 1000,
    lastUpdated: '2019-04-01T13:07:00.420Z',
    appetite: true
  },
  {
    buyerName: 'BTest',
    amount: 1000000,
    lastUpdated: '2019-04-06T13:07:00.420Z',
    appetite: true
  }
]

describe('withSort', () => {
  let items
  let sortingOption

  beforeEach(() => {
    items = mockItems
    sortingOption = {
      buyerName: 'string',
      amount: 'number',
      lastUpdated: 'data',
      appetite: 'boolean'
    }
  })

  it('should render component successfully', () => {
    const TableWithSort = withSort('buyerName', Order.Asc, sortingOption)(TestTable)
    const wrapper = shallow(<TableWithSort items={items} />)

    expect(wrapper.exists()).toBe(true)
  })

  it('should call default sorting option', () => {
    const TableWithSort = withSort('buyerName', Order.Asc, sortingOption)(TestTable)
    const wrapper = shallow(<TableWithSort items={items} />)

    expect(sortPerString).toHaveBeenCalledWith('buyerName', Order.Asc, items)
  })

  it('should set default state from props', () => {
    const TableWithSort = withSort('buyerName', Order.Asc, sortingOption)(TestTable)
    const wrapper = shallow(<TableWithSort items={items} />)

    expect(wrapper.state()).toEqual({ column: 'buyerName', direction: Order.Asc, sortedItems: items })
  })

  it('should call sortPerNumber with appropriate data when handleSort is called', () => {
    const TableWithSort = withSort('buyerName', Order.Asc, sortingOption)(TestTable)
    const wrapper = shallow(<TableWithSort items={items} />)

    const instance = wrapper.instance() as any
    instance.handleSort('amount')

    expect(sortPerNumber).toHaveBeenCalledWith('amount', Order.Desc, items)
  })

  it('should call sortPerDate with appropriate data when handleSort is called', () => {
    const TableWithSort = withSort('buyerName', Order.Asc, sortingOption)(TestTable)
    const wrapper = shallow(<TableWithSort items={items} />)

    const instance = wrapper.instance() as any
    instance.handleSort('lastUpdated')

    expect(sortPerNumber).toHaveBeenCalledWith('lastUpdated', Order.Desc, items)
  })

  it('should call sortPerBoolean with appropriate data when handleSort is called', () => {
    const TableWithSort = withSort('buyerName', Order.Asc, sortingOption)(TestTable)
    const wrapper = shallow(<TableWithSort items={items} />)

    const instance = wrapper.instance() as any
    instance.handleSort('appetite')

    expect(sortPerBoolean).toHaveBeenCalledWith('appetite', Order.Desc, items)
  })

  it('should call sortPerString and recreate items when props are changed', () => {
    const TableWithSort = withSort('buyerName', Order.Asc, sortingOption)(TestTable)
    const wrapper = shallow(<TableWithSort items={items} />)
    const newItems = [
      ...mockItems,
      {
        buyerName: 'CTest',
        amount: 1000,
        lastUpdated: '2019-04-01T13:07:00.420Z',
        appetite: true
      }
    ]
    wrapper.setProps({
      items: newItems
    })

    expect(sortPerString).toHaveBeenLastCalledWith('buyerName', Order.Asc, newItems)
  })
})
