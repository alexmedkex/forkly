import { shallow } from 'enzyme'
import { Input } from 'semantic-ui-react'
import * as React from 'react'

import { ErrorReportSubjectField } from './ErrorReportSubjectField'
import { ErrorLabel } from '../../../components/error-message/ErrorLabel'

const formikProps: any = {
  formik: {
    values: {
      subject: 'subject'
    },
    errors: {
      subject: ''
    },
    touched: {
      subject: false
    },
    handleChange: jest.fn()
  }
}

describe('ErrorReportSubjectField', () => {
  beforeEach(() => {
    formikProps.formik.handleChange.mockClear()
  })

  it('renders Input', () => {
    const component = shallow(<ErrorReportSubjectField {...formikProps} />)
    expect(component.find(Input).props()).toMatchObject({
      name: 'subject',
      onChange: expect.any(Function),
      value: 'subject'
    })
  })

  it('calls onChange on change event', () => {
    const component = shallow(<ErrorReportSubjectField {...formikProps} />)
    const onChange = component.find(Input).props().onChange
    onChange(null, { name: 'test', value: 'test' })
    expect(formikProps.formik.handleChange).toHaveBeenCalled()
  })

  it('renders ErrorLabel', () => {
    const withError = { formik: { ...formikProps.formik, errors: { subject: 'error' }, touched: { subject: true } } }
    const component = shallow(<ErrorReportSubjectField {...withError} />)
    const error = component.find(ErrorLabel)
    expect(error.length).toBe(1)
  })
})
