import * as React from 'react'
import { shallow } from 'enzyme'
import { Checkbox } from 'semantic-ui-react'
import CheckboxItems, { CheckboxItem, Info } from './CheckboxItems'

describe('CheckboxItems', () => {
  const defaultProps = {
    options: [{ value: 'test', name: 'Test' }],
    checked: [],
    handleSelect: jest.fn()
  }

  it('should render sucessfully', () => {
    const wrapper = shallow(<CheckboxItems {...defaultProps} />)

    expect(wrapper.exists()).toBe(true)
  })

  it('should find one CheckboxItem', () => {
    const wrapper = shallow(<CheckboxItems {...defaultProps} />)

    const checkboxes = wrapper.find(CheckboxItem)

    expect(checkboxes.length).toBe(1)
  })

  it('should find Checkbox which is checked', () => {
    const wrapper = shallow(<CheckboxItems {...defaultProps} checked={['test']} />)

    const checkbox = wrapper
      .find(CheckboxItem)
      .find(Checkbox)
      .first()

    expect(checkbox.prop('checked')).toBe(true)
  })

  it('should find Checkbox with handleSelect as prop for onChange', () => {
    const wrapper = shallow(<CheckboxItems {...defaultProps} checked={['test']} />)

    const checkbox = wrapper
      .find(CheckboxItem)
      .find(Checkbox)
      .first()

    expect(checkbox.prop('onChange')).toBe(defaultProps.handleSelect)
  })

  it('should find CheckboxItem with info if it is exist in options', () => {
    const options = [{ value: 'test', name: 'Test', info: 'Test' }]
    const wrapper = shallow(<CheckboxItems {...defaultProps} options={options} />)

    const checkboxItemInfo = wrapper
      .find(CheckboxItem)
      .first()
      .find(Info)
      .shallow()

    expect(checkboxItemInfo.text()).toBe('Test')
  })

  it('should not find info in CheckboxItem if info does not exist in options', () => {
    const wrapper = shallow(<CheckboxItems {...defaultProps} />)

    const checkboxItemInfo = wrapper
      .find(CheckboxItem)
      .first()
      .find(Info)

    expect(checkboxItemInfo.length).toBe(0)
  })
})
