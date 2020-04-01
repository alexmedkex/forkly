import { shallow } from 'enzyme'
import { Dropdown } from 'semantic-ui-react'
import * as React from 'react'

import { ErrorReportPriorityField } from './ErrorReportPriorityField'

const formikProps: any = {
  formik: {
    values: {
      severity: 'severity'
    },
    setFieldValue: jest.fn()
  }
}

describe('ErrorReportPriorityField', () => {
  beforeEach(() => {
    formikProps.formik.setFieldValue.mockClear()
  })

  it('renders TextArea enabled', () => {
    const component = shallow(<ErrorReportPriorityField {...formikProps} />)
    expect(component.find(Dropdown).props()).toMatchObject({
      name: 'severity',
      fluid: true,
      selection: true,
      onChange: expect.any(Function),
      value: 'severity'
    })
  })

  it('calls setFieldValue on change event', () => {
    const component = shallow(<ErrorReportPriorityField {...formikProps} />)
    const onChange = component.find(Dropdown).props().onChange
    onChange(null, { name: 'test', value: 'test' })
    expect(formikProps.formik.setFieldValue).toHaveBeenCalled()
  })
})
