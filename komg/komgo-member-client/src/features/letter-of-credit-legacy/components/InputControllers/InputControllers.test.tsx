import * as React from 'react'
import {
  GridTextController,
  CheckboxController,
  enumToRadioOptions,
  GridDropdownController,
  enumToDropdownOptions,
  RadioController,
  enumToDropdownOptionsCustomLabels
} from './InputControllers'
import { shallow, mount } from 'enzyme'
import { FieldProps } from 'formik'
import { Input, Checkbox, TextArea, Dropdown, Popup } from 'semantic-ui-react'
import { render } from '@testing-library/react'

export const testFormikFieldProps: FieldProps = {
  field: {
    onChange: jest.fn(),
    onBlur: jest.fn(),
    value: 'testValue',
    name: 'testName'
  },
  form: {
    values: {},
    touched: {},
    errors: {},
    isValidating: false,
    isSubmitting: false,
    submitCount: 0,
    setStatus: () => null,
    setError: () => null,
    setErrors: () => null,
    setSubmitting: () => null,
    setTouched: () => null,
    setValues: () => null,
    setFieldValue: () => null,
    setFieldTouched: () => null,
    setFieldError: () => null,
    validateForm: async () => ({ ['myFieldVal']: '' }),
    validateField: async () => ({ ['myFieldVal']: '' }),
    resetForm: () => null,
    submitForm: () => null,
    setFormikState: () => null,
    handleSubmit: () => null,
    handleReset: () => null,
    handleBlur: () => () => null,
    handleChange: () => () => null,
    dirty: false,
    isValid: true,
    initialValues: {},
    registerField: () => null,
    unregisterField: () => null
  }
}

describe('GridTextController', () => {
  beforeEach(() => {
    testFormikFieldProps.field.onChange = jest.fn()
    testFormikFieldProps.field.onBlur = jest.fn()
    testFormikFieldProps.field.value = 'testValue'
  })
  it('creates an input of type text', () => {
    const textInput = shallow(<GridTextController fieldName="myFieldName" {...testFormikFieldProps} />)

    expect(textInput.find(Input).length).toEqual(1)
  })
  it('calls field.onChange when changed', () => {
    const textInput = shallow(<GridTextController fieldName="myFieldName" {...testFormikFieldProps} />)

    textInput.find(Input).simulate('change', { target: { value: 'My new value' } })

    expect(testFormikFieldProps.field.onChange).toHaveBeenCalled()
  })
  it('calls field.onBlur when left', () => {
    const textInput = shallow(<GridTextController fieldName="myFieldName" {...testFormikFieldProps} />)

    textInput.find(Input).simulate('blur')

    expect(testFormikFieldProps.field.onBlur).toHaveBeenCalled()
  })
  it('contains the fieldName passed in as a label', () => {
    const textInput = shallow(<GridTextController fieldName="myNewFieldName" {...testFormikFieldProps} />)

    expect(textInput.find('label').text()).toEqual('myNewFieldName')
  })
  it('contains the input type text', () => {
    const textInput = shallow(<GridTextController fieldName="myNewFieldName" {...testFormikFieldProps} />)

    expect(textInput.find(Input).prop('type')).toEqual('text')
  })
  it('contains the name from the field props', () => {
    const textInput = shallow(<GridTextController fieldName="myNewFieldName" {...testFormikFieldProps} />)

    expect(textInput.find(Input).prop('name')).toEqual('testName')
  })
  it('contains the value from the field props', () => {
    const value = 'myTestValue'
    const props: any = {
      ...testFormikFieldProps,
      field: {
        ...testFormikFieldProps.form,
        value
      }
    }
    const textInput = shallow(<GridTextController fieldName="myNewFieldName" value="myTestValue" {...props} />)
    expect(textInput.find(Input).prop('value')).toEqual('myTestValue')
  })
  it('can be a textarea type', () => {
    const textInput = shallow(
      <GridTextController fieldName="myNewFieldName" type="textarea" {...testFormikFieldProps} />
    )

    expect(textInput.find(TextArea).length).toEqual(1)
  })
  it('can be a number type', () => {
    const textInput = shallow(<GridTextController fieldName="myNewFieldName" type="number" {...testFormikFieldProps} />)

    expect(textInput.find(Input).prop('type')).toEqual('number')
  })
  it('can be a date type', () => {
    const textInput = shallow(<GridTextController fieldName="myNewFieldName" type="date" {...testFormikFieldProps} />)

    expect(textInput.find(Input).prop('type')).toEqual('date')
  })
  it('is classname field error if errored', () => {
    const textInput = shallow(
      <GridTextController fieldName="myNewFieldName" type="date" {...testFormikFieldProps} error={true} />
    )

    expect(textInput.find(Input).prop('className')).toEqual('field error')
  })
  it('has a Popup (tooltip) defined if options exist', () => {
    const textInputWithTooltip = mount(
      <GridTextController
        fieldName="myNewFieldName"
        type="text"
        value="testValue"
        configuration={{ tooltipValue: 'testToolTipValue', maxLengthOfValue: 40 }}
        {...testFormikFieldProps}
      />
    )

    expect(textInputWithTooltip.find(Popup)).toBeDefined()
    expect(textInputWithTooltip.find(Input)).toBeDefined()
  })
})

describe('GridDropdownController', () => {
  let wrapper: any
  enum TEST_ENUM {
    ONE = 'ONE',
    TWO = 'TWO',
    THREE = 'THREE'
  }
  beforeEach(() => {
    testFormikFieldProps.field.onChange = jest.fn()
    testFormikFieldProps.field.onBlur = jest.fn()
    testFormikFieldProps.form.setFieldValue = jest.fn()
    testFormikFieldProps.field.value = ''
  })
  beforeAll(() => {
    wrapper = shallow(
      <GridDropdownController
        fieldName="myFieldName"
        options={enumToDropdownOptions(TEST_ENUM)}
        {...testFormikFieldProps}
      />
    )
  })
  it('creates an input of type dropdown', () => {
    expect(wrapper.find(Dropdown).length).toEqual(1)
  })
  it('matches snapshot', () => {
    expect(
      render(
        <GridDropdownController
          fieldName="myFieldName"
          options={enumToDropdownOptions(TEST_ENUM)}
          {...testFormikFieldProps}
        />
      ).asFragment()
    ).toMatchSnapshot()
  })
  it('is classname field error if it is errored', () => {
    wrapper = shallow(
      <GridDropdownController
        fieldName="myFieldName"
        options={enumToDropdownOptions(TEST_ENUM)}
        {...testFormikFieldProps}
        error={true}
      />
    )
    expect(wrapper.find(Dropdown).prop('className')).toEqual('field error dropdown-input')
  })
  it('renders with a tooltip if passed in with that option', () => {
    wrapper = mount(
      <GridDropdownController
        fieldName="myFieldName"
        options={enumToDropdownOptions(TEST_ENUM)}
        {...testFormikFieldProps}
        tooltip={true}
        tooltipValue={'testTooltipValue'}
      />
    )
    expect(wrapper.find(Popup)).toBeDefined()
    expect(wrapper.find(Popup).prop('content')).toEqual('testTooltipValue')
    expect(wrapper.find(Dropdown)).toBeDefined()
  })
})

describe('CheckboxController', () => {
  beforeEach(() => {
    testFormikFieldProps.field.onChange = jest.fn()
    testFormikFieldProps.field.onBlur = jest.fn()
    testFormikFieldProps.field.value = true
  })
  it('creates an input of type checkbox', () => {
    const wrapper = shallow(<CheckboxController fieldName="myFieldName" {...testFormikFieldProps} />)

    expect(wrapper.find(Checkbox).length).toEqual(1)
  })
  it('calls field.onChange when changed', () => {
    const wrapper = shallow(<CheckboxController fieldName="myFieldName" {...testFormikFieldProps} />)

    wrapper.find(Checkbox).simulate('change', { target: { value: 'My new value' } })

    expect(testFormikFieldProps.field.onChange).toHaveBeenCalled()
  })
  it('calls custom onChange handler when changed', () => {
    const myChangeHandler = jest.fn()

    const wrapper = shallow(
      <CheckboxController fieldName="myFieldName" {...testFormikFieldProps} customOnChange={myChangeHandler} />
    )

    wrapper.find(Checkbox).simulate('change', { target: { value: 'My new value' } })

    expect(myChangeHandler).toHaveBeenCalled()
  })
  it('calls field.onBlur when left', () => {
    const wrapper = shallow(<CheckboxController fieldName="myFieldName" {...testFormikFieldProps} />)

    wrapper.find(Checkbox).simulate('blur')

    expect(testFormikFieldProps.field.onBlur).toHaveBeenCalled()
  })
  it('contains the fieldName passed in as a label', () => {
    const wrapper = mount(<CheckboxController fieldName="myNewFieldName" {...testFormikFieldProps} />)

    expect(wrapper.find('label').text()).toEqual('myNewFieldName')
  })
  it('contains the input type checkbox', () => {
    const wrapper = shallow(<CheckboxController fieldName="myNewFieldName" {...testFormikFieldProps} />)

    expect(wrapper.find(Checkbox).prop('type')).toEqual('checkbox')
  })
  it('contains the id from the field props', () => {
    const wrapper = shallow(<CheckboxController fieldName="myNewFieldName" {...testFormikFieldProps} />)

    expect(wrapper.find(Checkbox).prop('id')).toEqual('testName')
  })
  it('contains a checked checkbox when the value from the field props is true', () => {
    const wrapper = shallow(<CheckboxController fieldName="myNewFieldName" {...testFormikFieldProps} />)

    expect(wrapper.find(Checkbox).prop('checked')).toEqual(true)
  })
  it('contains an unchecked checkbox when the value from the field props is false', () => {
    testFormikFieldProps.field.value = false
    const wrapper = shallow(<CheckboxController fieldName="myNewFieldName" {...testFormikFieldProps} />)

    expect(wrapper.find(Checkbox).prop('checked')).toEqual(false)
  })
})

describe('RadioController', () => {
  enum TEST_ENUM {
    ONE = 'ONE',
    TWO = 'TWO',
    THREE = 'THREE'
  }
  it('calls custom onChange handler when changed', () => {
    const myChangeHandler = jest.fn()

    const wrapper = shallow(
      <RadioController
        fieldName="myFieldName"
        {...testFormikFieldProps}
        options={enumToRadioOptions(TEST_ENUM)}
        customOnChange={myChangeHandler}
      />
    )

    wrapper.find({ label: 'One' }).simulate('change', { target: { value: true } })

    expect(myChangeHandler).toHaveBeenCalled()
  })
})

describe('enumToRadioOptions', () => {
  enum TEST_ENUM {
    ONE = 'ONE',
    TWO = 'TWO',
    THREE = 'THREE'
  }
  it('generates correct radio options for TEST_ENUM', () => {
    const options = enumToRadioOptions(TEST_ENUM)

    expect(options.length).toEqual(3)
    expect(options[0].value).toEqual(TEST_ENUM.ONE)
    expect(options[0].label).toEqual('One')
    expect(options[1].value).toEqual(TEST_ENUM.TWO)
    expect(options[1].label).toEqual('Two')
    expect(options[2].value).toEqual(TEST_ENUM.THREE)
    expect(options[2].label).toEqual('Three')
  })
  describe('with tooltip', () => {
    const TOOLTIP_TEST = {
      TWO: 'Tooltip for two'
    }

    const options = enumToRadioOptions(TEST_ENUM, TOOLTIP_TEST)

    expect(options.length).toEqual(3)
    expect(options[1].tooltip).toEqual(TOOLTIP_TEST.TWO)
  })
})

describe('enumToDropdownOptions', () => {
  it('should return dropdown formatted array', () => {
    enum Test {
      test = 'test'
    }

    expect(enumToDropdownOptions(Test, true)).toEqual([{ value: Test.test, text: Test.test, content: Test.test }])
  })
  it('should return empty array when enum is empty', () => {
    enum Test {}

    expect(enumToDropdownOptions(Test, true)).toEqual([])
  })
})

describe('enumToDropdownOptionsCustomLabels', () => {
  it('should return dropdown formatted array', () => {
    enum Test {
      test = 'test'
    }

    expect(enumToDropdownOptionsCustomLabels(Test)).toEqual([{ value: Test.test, text: 'Test', content: 'Test' }])
  })

  it('should return dropdown formatted array with custom labels', () => {
    enum Test {
      test = 'test',
      test2 = 'test2'
    }
    const labels = {
      test: 'test label',
      test2: 'test2 label'
    }

    expect(enumToDropdownOptionsCustomLabels(Test, labels)).toEqual([
      { value: Test.test, text: 'test label', content: 'test label' },
      { value: Test.test2, text: 'test2 label', content: 'test2 label' }
    ])
  })

  it('should return empty array when enum is empty', () => {
    enum Test {}

    expect(enumToDropdownOptionsCustomLabels(Test)).toEqual([])
  })
})
