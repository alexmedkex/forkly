import * as React from 'react'
import { shallow } from 'enzyme'
import ProductLicenseModal from './ProductLicenseModal'

describe('ProductLicenseModal component', () => {
  let defaultProps: any

  beforeEach(() => {
    defaultProps = {
      open: true,
      email: 'testEmail',
      closeModal: jest.fn()
    }
  })

  it('Should render ProductLicenseModal', () => {
    const wrapper = shallow(<ProductLicenseModal {...defaultProps} />)

    expect(wrapper.exists()).toBe(true)
  })

  it('Should call closeModal', () => {
    const wrapper = shallow(<ProductLicenseModal {...defaultProps} />)

    wrapper
      .find('Button')
      .at(0)
      .simulate('click')

    expect(defaultProps.closeModal).toHaveBeenCalled()
  })
})
