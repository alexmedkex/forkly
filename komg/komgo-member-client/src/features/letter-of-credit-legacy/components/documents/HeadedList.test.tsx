import * as React from 'react'
import { shallow } from 'enzyme'

import { HeadedList } from './HeadedList'

describe('LCDocumentsListHeader component', () => {
  it('renders a Header within a stylish grey segment', () => {
    const anonTitle = 'anon'
    const wrapper = shallow(<HeadedList title={anonTitle} items={[]} itemToListItemContent={jest.fn()} />)
    expect(wrapper.exists()).toBe(true)
  })

  it('renders an empty string in place of a falsy title', () => {
    const anonTitle = ''
    const wrapper = shallow(<HeadedList title={anonTitle} items={[]} itemToListItemContent={jest.fn()} />)
    expect(wrapper.exists()).toBe(true)
  })
})
