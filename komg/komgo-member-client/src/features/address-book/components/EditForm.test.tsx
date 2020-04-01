import { MemberType } from '@komgo/types'
import * as React from 'react'
import { ActionButtons } from './EditForm'
import { shallow } from 'enzyme'

const values = {
  x500Name: {
    PC: 'PC',
    CN: 'CN',
    C: 'C',
    STREET: 'STREET',
    L: 'L',
    O: 'O'
  },
  isFinancialInstitution: true,
  hasSWIFTKey: true,
  isMember: true,
  memberType: MemberType.FMS,
  staticId: 'staticId',
  vaktStaticId: 'staticId'
}

const testProps = {
  values,
  errors: {},
  touched: {},
  isValidating: false,
  isSubmitting: false,
  submitCount: 0,
  setStatus: () => null,
  setError: () => null,
  setErrors: () => null,
  setSubmitting: () => null,
  setTouched: () => null,
  setValues: () => null,
  setFieldValue: jest.fn(),
  setFieldTouched: () => null,
  setFieldError: () => null,
  validateForm: async () => ({}),
  validateField: async () => ({}),
  resetForm: () => null,
  submitForm: () => null,
  setFormikState: () => null,
  handleSubmit: jest.fn(),
  handleReset: () => null,
  handleBlur: () => () => null,
  handleChange: () => () => null,
  dirty: false,
  isValid: true,
  initialValues: values,
  registerField: jest.fn(),
  unregisterField: jest.fn(),
  isModification: true,
  staticId: 'staticId',
  onEditClick: jest.fn(),
  onClose: jest.fn(),
  clearError: jest.fn()
}

describe('Edit form', () => {
  it('should call handleSubmit', () => {
    const wrapper = shallow(<ActionButtons {...testProps} />)
    wrapper
      .find('[type="submit"]')
      .first()
      .simulate('click')
    expect(testProps.handleSubmit).toHaveBeenCalled()
  })
  it('should call handleSubmit on press Enter key', () => {
    const wrapper = shallow(<ActionButtons {...testProps} />)
    wrapper.simulate('keypress', { key: 'Enter' })
    expect(testProps.handleSubmit).toHaveBeenCalled()
  })
})
