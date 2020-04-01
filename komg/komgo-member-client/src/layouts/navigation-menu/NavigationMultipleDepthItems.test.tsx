import * as React from 'react'
import { shallow } from 'enzyme'
import NavigationMultipleDepthItems from './NavigationMultipleDepthItems'

describe('NavigationMultipleDepthItems component', () => {
  const defaultProps = {
    menuName: 'Counterparty admin',
    active: 'Test',
    children: ''
  }

  it('Should render component successfully', () => {
    const wrapper = shallow(<NavigationMultipleDepthItems {...defaultProps} />)
    expect(wrapper.exists()).toBe(true)
  })

  it('Should have state open to false', () => {
    const wrapper = shallow(<NavigationMultipleDepthItems {...defaultProps} />)

    expect(wrapper.state('open')).toBe(false)
  })

  it('Should change state open to true when name is the same as active', () => {
    const wrapper = shallow(<NavigationMultipleDepthItems {...defaultProps} />)

    wrapper.setProps({ ...defaultProps, active: defaultProps.menuName })

    expect(wrapper.state('open')).toBe(true)
  })
})
