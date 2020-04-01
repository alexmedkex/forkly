import * as React from 'react'
import { shallow } from 'enzyme'
import InputController from './InputController'

describe('InputController', () => {
  const defaultProps = {
    name: 'test',
    type: 'text',
    disabled: false,
    error: false,
    info: 'Info text',
    label: 'Label text',
    field: {
      name: 'test',
      value: 'some value'
    } as any
  } as any

  it('should render successfully', () => {
    const wrapper = shallow(<InputController {...defaultProps} />)

    expect(wrapper.exists()).toBe(true)
  })

  it('should render Input', () => {
    const wrapper = shallow(<InputController {...defaultProps} />)

    const input = wrapper.find('Input')

    expect(input.length).toBe(1)
  })

  it('should render TextArea', () => {
    const wrapper = shallow(<InputController {...defaultProps} type="textarea" />)

    const input = wrapper.find('TextArea')

    expect(input.length).toBe(1)
  })

  it('should find label when props for label is set', () => {
    const wrapper = shallow(<InputController {...defaultProps} />)

    const label = wrapper.find('label')

    expect(label.length).toBe(1)
  })

  it('should not find label when props for label is not set', () => {
    const wrapper = shallow(<InputController {...defaultProps} label={undefined} />)

    const label = wrapper.find('label')

    expect(label.length).toBe(0)
  })

  it('should find info when props for info is set', () => {
    const wrapper = shallow(<InputController {...defaultProps} />)

    const info = wrapper.find('small')

    expect(info.length).toBe(1)
  })

  it('should not find info when props for info is not set', () => {
    const wrapper = shallow(<InputController {...defaultProps} info={undefined} />)

    const info = wrapper.find('small')

    expect(info.length).toBe(0)
  })

  it('should find input with value props', () => {
    const wrapper = shallow(<InputController {...defaultProps} />)

    const input = wrapper.find('Input')

    expect(input.props().value).toBe('some value')
  })

  it('should find input with value which is set from value props instead of field.value', () => {
    const wrapper = shallow(<InputController {...defaultProps} value="OKOK" />)

    const input = wrapper.find('Input')

    expect(input.props().value).toBe('OKOK')
  })
})
