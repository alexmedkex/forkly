import * as renderer from 'react-test-renderer'
import * as React from 'react'

import { RenewalDateFilter, IRenewalDateFilterProps } from './RenewalDateFilter'
import { shallow } from 'enzyme'
import { FilterItem } from './FilterItem'

const defaultProps: IRenewalDateFilterProps = {
  count: [
    {
      key: 'all',
      value: 2
    }
  ],
  activeKey: 'all',
  onFilter: jest.fn()
}

it('should match snapshot', () => {
  const component = renderer.create(<RenewalDateFilter {...defaultProps} />).toJSON()

  expect(component).toMatchSnapshot()
})

it('should render items', () => {
  const wrapper = shallow(<RenewalDateFilter {...defaultProps} />)

  expect(wrapper.find(FilterItem).length).toBe(7)
})
