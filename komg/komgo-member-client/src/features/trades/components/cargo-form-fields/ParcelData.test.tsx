import * as React from 'react'
import { mount } from 'enzyme'
import * as renderer from 'react-test-renderer'
import { v4 } from 'uuid'
import ParcelData, { IProps, IParcelWithOverrides } from './ParcelData'
import { initialParcelData, TRADING_ROLE_OPTIONS } from '../../constants'
import { Button } from 'semantic-ui-react'

describe('ParcelData component', () => {
  let defaultProps: IProps
  beforeEach(() => {
    defaultProps = {
      initialParcelData,
      removeParcel: jest.fn(),
      onChange: jest.fn(),
      submitCount: 0,
      dataTestId: 'testParcel',
      tradingRole: TRADING_ROLE_OPTIONS.BUYER
    }
  })

  it('should match snapshot', () => {
    expect(renderer.create(<ParcelData {...defaultProps} />).toJSON()).toMatchSnapshot()
  })

  it('should call removeParcel when close icon clicked', () => {
    const wrapper = mount(<ParcelData {...defaultProps} />)

    wrapper.find('i[data-test-id="testParcel-removeParcel"]').simulate('click')

    wrapper
      .find(Button)
      .find({ content: 'Confirm' })
      .simulate('click')

    expect(defaultProps.removeParcel).toHaveBeenCalled()
  })

  it('should call onChange handler with parcel when a field is changed', () => {
    const wrapper = mount(<ParcelData {...defaultProps} />)

    const value = v4()

    wrapper.find('input[name="id"]').simulate('change', { target: { value, name: 'id' } })

    const expected: IParcelWithOverrides = { ...defaultProps.initialParcelData, id: value }

    expect(defaultProps.onChange).toHaveBeenCalledWith(expected)
  })

  it('should increment submitCounter when submitCount prop is updated', () => {
    const wrapper = mount<IProps>(<ParcelData {...defaultProps} />)
    expect(wrapper.state().submitCounter).toEqual(0)

    wrapper.setProps({ submitCount: 1 })
    wrapper.update()

    expect(wrapper.state().submitCounter).toEqual(1)
  })
})
