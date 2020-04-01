import { shallow } from 'enzyme'
import { Field } from 'formik'
import { Checkbox, Radio } from 'semantic-ui-react'
import * as React from 'react'

import { ActionRow, FormikCheckbox, FormikRadio } from './ActionRow'

const actionRowNoPermissionsProps: any = {
  isAuthorized: jest.fn(() => true),
  productId: 'product-id',
  action: {
    id: 'manageKyc',
    label: 'Manage KYC',
    permissions: []
  }
}

const actionRowMultipleProps: any = {
  isAuthorized: jest.fn(() => true),
  productId: 'product-id',
  action: {
    id: 'manageKyc',
    label: 'Manage KYC',
    permissions: [{ id: 'read', label: 'Read' }, { id: 'createAndShare', label: 'Create And Share' }]
  }
}

const formikCheckboxProps: any = {
  field: {
    value: true,
    name: 'field-name'
  },
  form: {
    setFieldValue: jest.fn()
  },
  linkedName: 'test',
  onChange: jest.fn()
}

const formikRadioProps: any = {
  field: {
    value: 'crud',
    name: 'field-name'
  },
  form: {
    setFieldValue: jest.fn()
  },
  id: 'crud'
}

describe('ActionRow', () => {
  it('renders action label', () => {
    const component = shallow(<ActionRow {...actionRowNoPermissionsProps} />)
    expect(component.find({ children: 'Manage KYC' }).length).toEqual(1)
  })

  it('renders permission field for Checkbox', () => {
    const component = shallow(<ActionRow {...actionRowNoPermissionsProps} />)
    expect(component.find(Field).props()).toMatchObject({
      component: FormikCheckbox,
      linkedName: 'permissions.product-id:manageKyc',
      name: 'rowCheckboxes.product-id:manageKyc'
    })
  })

  it('renders checked permission field for Checkbox with no permission', () => {
    const component = shallow(<ActionRow {...actionRowNoPermissionsProps} />)
    const instance: any = component.instance()
    const setFieldValue = jest.fn()
    instance.onCheckboxChange({ name: 'name', linkedName: 'linkedName', checked: true, form: { setFieldValue } })
    expect(setFieldValue).toHaveBeenCalledWith('linkedName', true)
    expect(setFieldValue).toHaveBeenCalledWith('name', true)
  })

  it('renders checked permission field for Checkbox with multiple permissions', () => {
    const component = shallow(<ActionRow {...actionRowMultipleProps} />)
    const instance: any = component.instance()
    const setFieldValue = jest.fn()
    instance.onCheckboxChange({ name: 'name', linkedName: 'linkedName', checked: true, form: { setFieldValue } })
    expect(setFieldValue).toHaveBeenCalledWith('linkedName', 'read')
    expect(setFieldValue).toHaveBeenCalledWith('name', true)
  })

  it('renders unchecked permission field for Checkbox', () => {
    const component = shallow(<ActionRow {...actionRowMultipleProps} />)
    const instance: any = component.instance()
    const setFieldValue = jest.fn()
    instance.onCheckboxChange({ name: 'name', linkedName: 'linkedName', checked: false, form: { setFieldValue } })
    expect(setFieldValue).toHaveBeenCalledWith('linkedName', undefined)
    expect(setFieldValue).toHaveBeenCalledWith('name', undefined)
  })

  it('renders number of permission fields correctly', () => {
    const component = shallow(<ActionRow {...actionRowMultipleProps} />)
    expect(component.find(Field)).toHaveLength(3)
  })

  it('renders permission Radio fields correctly', () => {
    const component = shallow(<ActionRow {...actionRowMultipleProps} />)

    expect(
      component
        .find(Field)
        .at(1)
        .props()
    ).toMatchObject({
      component: FormikRadio,
      name: 'permissions.product-id:manageKyc',
      label: 'Read'
    })
    expect(
      component
        .find(Field)
        .at(2)
        .props()
    ).toMatchObject({
      component: FormikRadio,
      name: 'permissions.product-id:manageKyc',
      label: 'Create And Share'
    })
  })
})

describe('FormikCheckbox', () => {
  beforeEach(() => {
    formikCheckboxProps.onChange.mockClear()
  })

  it('renders Checkbox', () => {
    const component = shallow(<FormikCheckbox {...formikCheckboxProps} />)
    expect(component.find(Checkbox).props()).toMatchObject({
      checked: true,
      name: 'field-name',
      onChange: expect.any(Function),
      type: 'checkbox'
    })
  })

  it('calls onChange on checkbox change event', () => {
    const component = shallow(<FormikCheckbox {...formikCheckboxProps} />)
    const onChange = component.find(Checkbox).props().onChange
    onChange(null, { name: 'test', checked: true })
    expect(formikCheckboxProps.onChange).toHaveBeenCalled()
  })

  it("doesn't call onChange on checkbox change event if name is empty", () => {
    const component = shallow(<FormikCheckbox {...formikCheckboxProps} />)
    const onChange = component.find(Checkbox).props().onChange
    onChange(null, { name: undefined, checked: true })
    expect(formikCheckboxProps.onChange).not.toHaveBeenCalled()
  })
})

describe('FormikRadio', () => {
  beforeEach(() => {
    formikRadioProps.form.setFieldValue.mockClear()
  })

  it('renders Radio', () => {
    const component = shallow(<FormikRadio {...formikRadioProps} />)
    expect(component.find(Radio).props()).toMatchObject({
      name: 'field-name',
      onChange: expect.any(Function),
      type: 'radio',
      checked: true,
      value: 'crud'
    })
  })

  it('calls setFieldValue on radio button change event', () => {
    const component = shallow(<FormikRadio {...formikRadioProps} />)
    const onChange = component.find(Radio).props().onChange
    onChange(null, { name: 'name', value: 'value' })
    expect(formikRadioProps.form.setFieldValue).toHaveBeenCalledWith('name', 'value')
  })

  it("doesn't call setFieldValue on radio button change event if name is empty", () => {
    const component = shallow(<FormikRadio {...formikRadioProps} />)
    const onChange = component.find(Radio).props()
    onChange.onChange(null, {})
    expect(formikRadioProps.form.setFieldValue).not.toHaveBeenCalled()
  })
})
