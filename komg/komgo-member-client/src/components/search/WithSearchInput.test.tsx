import * as React from 'react'
import * as renderer from 'react-test-renderer'
import { shallow } from 'enzyme'

import WithSearchInput from './WithSearchInput'

describe('WithSearchInput', () => {
  let defaultProps

  beforeEach(() => {
    defaultProps = {
      render: jest.fn(search => <div>{search}</div>),
      onSearchChange: jest.fn()
    }
  })

  it('should match default snapshot', () => {
    expect(renderer.create(<WithSearchInput {...defaultProps} />).toJSON()).toMatchSnapshot()
  })

  it('should store search in state, call onSearchChange prop and call render prop with new search', () => {
    const wrapper = shallow(<WithSearchInput {...defaultProps} />)

    const search = wrapper.find('[data-test-id="search"]')

    search.simulate('change', null, { value: 'test' })

    expect(wrapper.state('search')).toBe('test')
    expect(defaultProps.onSearchChange).toHaveBeenCalledWith('test')
    expect(defaultProps.render).toHaveBeenCalledWith('test')
  })

  it('should reset search when x is clicked', () => {
    const wrapper = shallow(<WithSearchInput {...defaultProps} />)

    wrapper.setState({
      search: 'test'
    })

    const clearButton = wrapper.find('[data-test-id="clear-search"]')

    clearButton.simulate('click')

    expect(wrapper.state('search')).toBe('')
    expect(defaultProps.onSearchChange).toHaveBeenCalledWith('')
  })
})
