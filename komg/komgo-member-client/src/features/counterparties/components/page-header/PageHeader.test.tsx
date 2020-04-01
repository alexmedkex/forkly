import * as React from 'react'
import { shallow } from 'enzyme'
import PageHeader, { Props } from './PageHeader'

const defaultProps: Props = {
  searchValue: '',
  pageName: 'Test Page',
  buttonContent: 'Add',
  shouldRenderButton: true,
  handleButtonClick: jest.fn(),
  handleSearch: jest.fn()
}

describe('PageHeader component', () => {
  it('should render PageHeader successfully', () => {
    const wrapper = shallow(<PageHeader {...defaultProps} />)

    expect(wrapper.exists()).toBe(true)
  })

  it('should find page name', () => {
    const wrapper = shallow(<PageHeader {...defaultProps} />)

    expect(
      wrapper
        .find('Header')
        .shallow()
        .text()
    ).toBe('Test Page')
  })

  it('should find button', () => {
    const wrapper = shallow(<PageHeader {...defaultProps} />)

    expect(wrapper.find('Button').length).toBe(1)
  })

  it('should find button with buttonContent text', () => {
    const wrapper = shallow(<PageHeader {...defaultProps} />)

    expect(
      wrapper
        .find('Button')
        .shallow()
        .text()
    ).toBe('Add')
  })

  it('when button is clicked handleButtonClick function should be called', () => {
    const wrapper = shallow(<PageHeader {...defaultProps} />)

    wrapper.find('Button').simulate('click')

    expect(defaultProps.handleButtonClick).toHaveBeenCalled()
  })
})
