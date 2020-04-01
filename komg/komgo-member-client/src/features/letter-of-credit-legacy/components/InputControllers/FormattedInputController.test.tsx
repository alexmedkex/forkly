import * as React from 'react'
import { FormattedInputController, FormattedInputControllerProps } from './FormattedInputController'
import Numeral from 'numeral'
import { testFormikFieldProps } from './InputControllers.test'
import { shallow } from 'enzyme'

const formattedValue = 'fish'
const initialValue = 2

const formattedInputInputProps: FormattedInputControllerProps<number> = {
  initialValue,
  formatAsString: () => formattedValue,
  toValue: () => initialValue,
  setFieldValue: jest.fn(),
  setFieldTouched: jest.fn(),
  fieldName: 'field',
  defaultValue: 0
}

describe('FormattedInputController', () => {
  describe('when not in focus', () => {
    beforeEach(() => {
      formattedInputInputProps.setFieldTouched = jest.fn()
      formattedInputInputProps.setFieldValue = jest.fn()
    })
    it('displays the formatted string', () => {
      const wrapper = shallow(<FormattedInputController {...formattedInputInputProps} {...testFormikFieldProps} />)

      expect(wrapper.prop('value')).toEqual(formattedValue)
    })
    it('displays the formatted string when blurred', () => {
      const wrapper = shallow(<FormattedInputController {...formattedInputInputProps} {...testFormikFieldProps} />)
      wrapper.simulate('focus')
      wrapper.simulate('blur')

      expect(wrapper.prop('value')).toEqual(formattedValue)
    })
    it('allows an update and displays the reformatted version after blur', () => {
      const wrapper = shallow(
        <FormattedInputController
          {...formattedInputInputProps}
          {...testFormikFieldProps}
          formatAsString={(v: number) => `${formattedValue}${v}`}
          toValue={(s: string | number) => Numeral(s).value()}
        />
      )
      wrapper.simulate('focus')
      wrapper.simulate('change', { target: { value: '10' } })
      wrapper.simulate('blur')

      expect(wrapper.prop('value')).toEqual('fish10')
    })
    it('calls setFieldValue with the fieldName and value on blur', () => {
      const wrapper = shallow(
        <FormattedInputController
          {...formattedInputInputProps}
          {...testFormikFieldProps}
          formatAsString={(v: number) => `${formattedValue}${v}`}
        />
      )
      wrapper.simulate('focus')
      wrapper.simulate('blur')

      expect(formattedInputInputProps.setFieldValue).toHaveBeenCalledWith(testFormikFieldProps.field.name, initialValue)
    })
    it('calls setFieldValue with defaultValue if value is empty', () => {
      const wrapper = shallow(
        <FormattedInputController
          {...formattedInputInputProps}
          {...testFormikFieldProps}
          formatAsString={(v: number) => `${formattedValue}${v}`}
          toValue={(s: string | number) => Numeral(s).value()}
        />
      )
      wrapper.simulate('focus')
      wrapper.simulate('change', { target: { value: '' } })
      wrapper.simulate('blur')

      expect(formattedInputInputProps.setFieldValue).toHaveBeenCalledWith(
        testFormikFieldProps.field.name,
        formattedInputInputProps.defaultValue
      )
    })
    it('calls setFieldTouched with the fieldName and true on blur', () => {
      const wrapper = shallow(
        <FormattedInputController
          {...formattedInputInputProps}
          {...testFormikFieldProps}
          formatAsString={(v: number) => `${formattedValue}${v}`}
        />
      )
      wrapper.simulate('focus')
      wrapper.simulate('blur')

      expect(formattedInputInputProps.setFieldTouched).toHaveBeenCalledWith(testFormikFieldProps.field.name, true)
    })
    it('calls onChange instead of setFieldTouched/setFieldValue if onChange is given', () => {
      const onChange = jest.fn()
      const wrapper = shallow(
        <FormattedInputController
          {...formattedInputInputProps}
          {...testFormikFieldProps}
          formatAsString={(v: number) => `${formattedValue}${v}`}
          onChange={onChange}
          toValue={(s: string | number) => Numeral(s).value()}
        />
      )

      wrapper.simulate('focus')
      wrapper.simulate('change', { target: { value: '100' } })
      wrapper.simulate('blur')

      expect(formattedInputInputProps.setFieldTouched).not.toHaveBeenCalled()
      expect(formattedInputInputProps.setFieldValue).not.toHaveBeenCalled()
      expect(onChange).toHaveBeenCalledWith(100)
    })
  })
  describe('when in focus', () => {
    it('displays the value', () => {
      const wrapper = shallow(<FormattedInputController {...formattedInputInputProps} {...testFormikFieldProps} />)
      wrapper.simulate('focus')

      expect(wrapper.prop('value')).toEqual(wrapper.state().value)
    })
    it('allows changing of the value to another', () => {
      const wrapper = shallow(
        <FormattedInputController
          {...formattedInputInputProps}
          {...testFormikFieldProps}
          toValue={(s: string | number) => Numeral(s).value()}
        />
      )
      wrapper.simulate('focus')
      wrapper.simulate('change', { target: { value: '10' } })

      expect(wrapper.prop('value')).toEqual('10')
    })
  })
})
