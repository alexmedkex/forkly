import * as React from 'react'
import { shallow } from 'enzyme'
import Sort from './Sort'

const defaultProps = {
  columnKey: 'name',
  handleSort: jest.fn()
}

describe('Sort component', () => {
  it('should render Sort component', () => {
    // Act
    const wrapper = shallow(<Sort {...defaultProps} />)
    // Assert
    expect(wrapper.exists()).toBe(true)
  })

  it('should found two icon element', () => {
    // Act
    const wrapper = shallow(<Sort {...defaultProps} />)
    // Assert
    expect(wrapper.find('Icon').length).toBe(2)
  })

  it('should call handleSort when down is clicked', () => {
    // Act
    const wrapper = shallow(<Sort {...defaultProps} />)
    // Assert
    wrapper
      .find('Icon')
      .first()
      .simulate('click')
    expect(defaultProps.handleSort).toHaveBeenCalledWith('name', 'descending')
  })

  it('should call handleSort when down is clicked', () => {
    // Act
    const wrapper = shallow(<Sort {...defaultProps} />)
    // Assert
    wrapper
      .find('Icon')
      .at(1)
      .simulate('click')
    expect(defaultProps.handleSort).toHaveBeenCalledWith('name', 'ascending')
  })
})
