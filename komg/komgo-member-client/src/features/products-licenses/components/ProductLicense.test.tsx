import * as React from 'react'
import { shallow } from 'enzyme'
import { ProductLicense } from './ProductLicense'
import { products } from '../products'

describe('ProductLicense component', () => {
  let defaultProps: any

  beforeEach(() => {
    defaultProps = {
      licenseEnabled: false,
      color: '#ffffff',
      sendRequest: jest.fn(),
      product: products[0]
    }
  })

  it('Should render ProductLicense', () => {
    const wrapper = shallow(<ProductLicense {...defaultProps} />)

    expect(wrapper.exists()).toBe(true)
  })

  it('Should call sendRequest', () => {
    const wrapper = shallow(<ProductLicense {...defaultProps} />)

    wrapper
      .find('Button')
      .at(0)
      .simulate('click')

    expect(defaultProps.sendRequest).toHaveBeenCalled()
  })

  it('Should not render button', () => {
    defaultProps.licenseEnabled = true
    const wrapper = shallow(<ProductLicense {...defaultProps} />)

    expect(wrapper.find('Button').length).toBe(0)
  })
})
