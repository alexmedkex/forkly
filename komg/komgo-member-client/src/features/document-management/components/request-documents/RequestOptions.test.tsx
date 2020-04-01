import * as React from 'react'
import { shallow } from 'enzyme'
import * as renderer from 'react-test-renderer'

import { RequestOptions } from './RequestOptions'
import { fakeFormikContext } from '../../../../store/common/faker'
import { IRequestDocumentForm, requestDocumentFormDefaultValue } from '../../containers/RequestDocumentsContainer'

describe('RequestOptions', () => {
  let defaultProps

  beforeEach(() => {
    Date.now = jest.fn(() => 1567773320212)
    defaultProps = {
      formik: fakeFormikContext<IRequestDocumentForm>(requestDocumentFormDefaultValue, {
        setFieldTouched: jest.fn(),
        setFieldValue: jest.fn()
      })
    }
  })

  it('should match default snapshot', () => {
    expect(renderer.create(<RequestOptions {...defaultProps} />).toJSON()).toMatchSnapshot()
  })

  it('should call functions from formik to set value and touched for deadline toggle when handleToggleDeadLine is called', () => {
    const wrapper = shallow(<RequestOptions {...defaultProps} />)

    const toggle = wrapper.find('[data-test-id="deadline-toggle"]')

    toggle.simulate('change', null, { checked: true })

    expect(defaultProps.formik.setFieldValue).toHaveBeenCalledWith('isDeadlineOn', true)
    expect(defaultProps.formik.setFieldTouched).toHaveBeenCalledWith('isDeadlineOn')
  })

  it('should call functions from formik to set value, and calculate date for deadline amount when valid value is sent - less then 1000 and positive', () => {
    const wrapper = shallow(
      <RequestOptions
        formik={{
          ...defaultProps.formik,
          values: { ...requestDocumentFormDefaultValue, isDeadlineOn: true },
          touched: { isDeadlineOn: true }
        }}
      />
    )

    const input = wrapper.find('[data-test-id="deadline-date-amount"]')

    input.simulate('change', null, { value: '2' })

    expect(defaultProps.formik.setFieldValue).toHaveBeenCalledWith('deadlineDateAmount', 2)
    expect(defaultProps.formik.setFieldValue).toHaveBeenCalledWith('deadline', new Date('2019-09-08T12:35:20.212Z'))
    expect(defaultProps.formik.setFieldTouched).toHaveBeenCalledWith('deadline')
  })

  it('should not call functions from formik to set value and touched for deadline amount when number is more then 1000', () => {
    const wrapper = shallow(
      <RequestOptions
        {...defaultProps}
        formik={{
          ...defaultProps.formik,
          values: { ...requestDocumentFormDefaultValue, isDeadlineOn: true },
          touched: { isDeadlineOn: true }
        }}
      />
    )

    const input = wrapper.find('[data-test-id="deadline-date-amount"]')

    input.simulate('change', null, { value: '999999' })

    expect(defaultProps.formik.setFieldValue).not.toHaveBeenCalled()
  })

  it('should call formik functions to set value and touched when period has changed - handleChangeDatePeriod', () => {
    const wrapper = shallow(
      <RequestOptions
        {...defaultProps}
        formik={{
          ...defaultProps.formik,
          values: { ...requestDocumentFormDefaultValue, isDeadlineOn: true },
          touched: { isDeadlineOn: true }
        }}
      />
    )

    const dropdown = wrapper.find('[data-test-id="deadline-date-period"]')

    dropdown.simulate('change', null, { value: 'months' })

    expect(defaultProps.formik.setFieldValue).toHaveBeenCalledWith('deadlineDatePeriod', 'months')
    expect(defaultProps.formik.setFieldTouched).toHaveBeenCalledWith('deadlineDatePeriod')
  })

  it('should print error when amount is less then 0', () => {
    const wrapper = shallow(
      <RequestOptions
        formik={{
          ...defaultProps.formik,
          values: { ...requestDocumentFormDefaultValue, deadlineDateAmount: -2, isDeadlineOn: true },
          touched: { deadlineDateAmount: true, isDeadlineOn: true },
          errors: { deadlineDateAmount: 'Error' }
        }}
      />
    )

    const error = wrapper.find('FieldError')

    expect(error.prop('show')).toBe(true)
  })

  it('should print date once deadline is diff then undefined', () => {
    const wrapper = shallow(
      <RequestOptions
        formik={{
          ...defaultProps.formik,
          values: { ...requestDocumentFormDefaultValue, deadline: new Date('09-08-2019'), isDeadlineOn: true },
          touched: { deadline: true, isDeadlineOn: true }
        }}
      />
    )

    const deadline = wrapper.find('[data-test-id="deadline"]')

    expect(deadline.shallow().text()).toBe('8 Sep 2019')
  })
})
