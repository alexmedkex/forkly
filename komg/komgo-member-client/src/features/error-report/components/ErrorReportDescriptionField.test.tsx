import { shallow } from 'enzyme'
import { TextArea } from 'semantic-ui-react'
import * as React from 'react'

import { ErrorReportDescriptionField } from './ErrorReportDescriptionField'
import { ErrorLabel } from '../../../components/error-message/ErrorLabel'

const formikProps: any = {
  formik: {
    values: {
      description: 'description'
    },
    errors: {
      description: ''
    },
    touched: {
      description: false
    },
    handleChange: jest.fn()
  }
}

describe('ErrorReportDescriptionField', () => {
  beforeEach(() => {
    formikProps.formik.handleChange.mockClear()
  })

  it('renders TextArea', () => {
    const component = shallow(<ErrorReportDescriptionField {...formikProps} />)
    expect(component.find(TextArea).props()).toMatchObject({
      as: 'textarea',
      name: 'description',
      onChange: expect.any(Function),
      rows: '4',
      size: 'mini',
      value: 'description'
    })
  })

  it('calls onChange on change event', () => {
    const component = shallow(<ErrorReportDescriptionField {...formikProps} />)
    const onChange = component.find(TextArea).props().onChange
    onChange(null, { name: 'test', value: 'test' })
    expect(formikProps.formik.handleChange).toHaveBeenCalled()
  })

  it('renders ErrorLabel', () => {
    const withError = {
      formik: { ...formikProps.formik, errors: { description: 'error' }, touched: { description: true } }
    }
    const component = shallow(<ErrorReportDescriptionField {...withError} />)
    const error = component.find(ErrorLabel)
    expect(error.length).toBe(1)
  })
})
