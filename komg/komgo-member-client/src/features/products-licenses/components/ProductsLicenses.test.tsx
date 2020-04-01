import * as React from 'react'
import { shallow, mount } from 'enzyme'
import { ProductsLicenses } from './ProductsLicenses'
import { products } from '../products'
import Unauthorized from '../../../components/unauthorized'

describe('ProductsLicenses component', () => {
  let defaultProps: any

  beforeEach(() => {
    defaultProps = {
      fetchMembers: jest.fn(),
      profile: {
        email: 'testemail',
        company: 'testcompany'
      },
      members: { testcompany: { x500Name: { O: 'testCompanyName' } } },
      isLicenseEnabled: jest.fn(() => true),
      isAuthorized: jest.fn(() => true)
    }
  })

  it('Should render ProductsLicenses', () => {
    const wrapper = shallow(<ProductsLicenses {...defaultProps} />)

    expect(wrapper.exists()).toBe(true)
  })

  it('calls componentDidMount', () => {
    const spy = jest.spyOn(ProductsLicenses.prototype, 'componentDidMount')
    mount(<ProductsLicenses {...defaultProps} />)
    expect(spy).toHaveBeenCalled()
    expect(defaultProps.isLicenseEnabled).toHaveBeenCalled()
    spy.mockReset()
    spy.mockRestore()
  })

  it('open window with company name', () => {
    window.open = jest.fn()
    const wrapper = shallow(<ProductsLicenses {...defaultProps} />)
    const instance: any = wrapper.instance()
    instance.sendRequest(products[0])
    expect(window.open).toHaveBeenCalled()
  })

  it('open window without company name', () => {
    defaultProps.profile.company = undefined
    window.open = jest.fn()
    const wrapper = shallow(<ProductsLicenses {...defaultProps} />)
    const instance: any = wrapper.instance()
    instance.sendRequest(products[0])
    expect(window.open).toHaveBeenCalled()
  })

  it('renders Unauthorized component', () => {
    defaultProps.isAuthorized = () => false
    const wrapper = shallow(<ProductsLicenses {...defaultProps} />)

    const components = wrapper.find('Unauthorized')

    expect(components.length).toBe(1)
  })
})
