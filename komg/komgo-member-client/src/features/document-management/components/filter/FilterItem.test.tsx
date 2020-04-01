import * as renderer from 'react-test-renderer'
import * as React from 'react'

import { RenewalDateFilter, IRenewalDateFilterProps } from './RenewalDateFilter'
import { shallow } from 'enzyme'
import { FilterItem, IFilterItemProps, CountWrap, ItemWrap } from './FilterItem'

const defaultProps: IFilterItemProps = {
  filterKey: 'key',
  title: 'title',
  count: '10',
  activeKey: '',
  onFilter: jest.fn()
}

it('should match snapshot', () => {
  const component = renderer.create(<FilterItem {...defaultProps} />).toJSON()

  expect(component).toMatchSnapshot()
})

it('should render active state if key active', () => {
  const props = { ...defaultProps, activeKey: 'key' }
  const wrapper = shallow(<FilterItem {...props} />)

  expect(wrapper.find(ItemWrap).props().active).toBe(true)
})

it('should render count', () => {
  const wrapper = shallow(<FilterItem {...defaultProps} />)

  expect(
    wrapper
      .find(CountWrap)
      .dive()
      .text()
  ).toBe(`(${defaultProps.count})`)
})

it('should trigger callback', () => {
  const wrapper = shallow(<FilterItem {...defaultProps} />)

  wrapper.find(ItemWrap).simulate('click')

  expect(defaultProps.onFilter).toBeCalledWith(defaultProps.filterKey)
})
