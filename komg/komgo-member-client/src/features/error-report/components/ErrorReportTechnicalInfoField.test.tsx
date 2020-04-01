import { shallow } from 'enzyme'
import { TextArea } from 'semantic-ui-react'
import * as React from 'react'

import { ErrorReportTechnicalInfoField } from './ErrorReportTechnicalInfoField'

const formikProps: any = {
  formik: {
    values: {
      technicalInfo: 'technicalInfo',
      addTechnicalInfo: true
    },
    handleChange: jest.fn()
  }
}

describe('ErrorReportTechnicalInfoField', () => {
  beforeEach(() => {
    formikProps.formik.handleChange.mockClear()
  })

  it('renders TextArea enabled', () => {
    const component = shallow(<ErrorReportTechnicalInfoField {...formikProps} />)
    expect(component.find(TextArea).props()).toMatchObject({
      as: 'textarea',
      name: 'technicalInfo',
      disabled: false,
      onChange: expect.any(Function),
      rows: '4',
      size: 'mini',
      value: 'technicalInfo'
    })
  })

  it('renders TextArea disabled', () => {
    formikProps.formik.values.addTechnicalInfo = false
    const component = shallow(<ErrorReportTechnicalInfoField {...formikProps} />)
    expect(component.find(TextArea).props()).toMatchObject({
      as: 'textarea',
      name: 'technicalInfo',
      disabled: true,
      onChange: expect.any(Function),
      rows: '4',
      size: 'mini',
      value: 'technicalInfo'
    })
  })

  it('calls onChange on change event', () => {
    const component = shallow(<ErrorReportTechnicalInfoField {...formikProps} />)
    const onChange = component.find(TextArea).props().onChange
    onChange(null, { name: 'test', value: 'test' })
    expect(formikProps.formik.handleChange).toHaveBeenCalled()
  })
})
