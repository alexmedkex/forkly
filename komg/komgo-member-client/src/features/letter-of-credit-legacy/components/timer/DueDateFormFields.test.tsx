import * as React from 'react'
import { shallow } from 'enzyme'
import { Field } from 'formik'
import { Radio } from 'semantic-ui-react'
import { DueDateFormFields } from './DueDateFormFields'
import { TIME_UNIT_DUE_DATE } from '../../constants'

describe('DueDateFormFields component', () => {
  let defaultProps

  beforeEach(() => {
    Date.now = jest.fn(() => 1487076708000)
    defaultProps = {
      formik: {
        setFieldValue: jest.fn(),
        errors: {},
        values: {}
      }
    }
  })

  it('should render successfully', () => {
    const wrapper = shallow(<DueDateFormFields {...defaultProps} />)

    expect(wrapper.exists()).toBe(true)
  })

  it('should find radio which is not checked and not find input fields and ExpireDateForm component', () => {
    const wrapper = shallow(<DueDateFormFields {...defaultProps} />)

    const toggle = wrapper.find(Radio).first()
    const inputFields = wrapper.find(Field)
    const expiredDateForm = wrapper.find('ExpiredDateForm')

    expect(toggle.prop('checked')).toBeFalsy()
    expect(inputFields.length).toBe(0)
    expect(expiredDateForm.length).toBe(0)
  })

  it('should find radio which is checked and  find input fields and ExpireDateForm component', () => {
    const props = {
      formik: {
        ...defaultProps.formik,
        values: { issueDueDateActive: true, issueDueDateDuration: 1, issueDueDateUnit: TIME_UNIT_DUE_DATE.DAYS }
      }
    }
    const wrapper = shallow(<DueDateFormFields {...props} />)

    const toggle = wrapper.find(Radio).first()
    const inputFields = wrapper.find(Field)
    const expiredDateForm = wrapper.find('ExpiredDateForm')

    expect(toggle.prop('checked')).toBe(true)
    expect(inputFields.length).toBe(2)
    expect(expiredDateForm.length).toBe(1)
  })

  it('should call setFieldValue function when toggle is changed', () => {
    const wrapper = shallow(<DueDateFormFields {...defaultProps} />)

    const toggle = wrapper.find(Radio).first()
    toggle.simulate('change', {}, { checked: true })

    expect(defaultProps.formik.setFieldValue).toHaveBeenCalledWith('issueDueDateActive', true)
    expect(defaultProps.formik.setFieldValue).toHaveBeenCalledTimes(3)
  })
})
