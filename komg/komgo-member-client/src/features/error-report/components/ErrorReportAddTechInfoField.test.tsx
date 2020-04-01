import { shallow } from 'enzyme'
import { Checkbox } from 'semantic-ui-react'
import * as React from 'react'

import { ErrorReportAddTechInfoField } from './ErrorReportAddTechInfoField'

const formikCheckboxProps: any = {
  formik: {
    values: {
      addTechnicalInfo: true
    },
    setFieldValue: jest.fn()
  }
}

describe('ErrorReportAddTechInfoField', () => {
  beforeEach(() => {
    formikCheckboxProps.formik.setFieldValue.mockClear()
  })

  it('renders Checkbox', () => {
    const component = shallow(<ErrorReportAddTechInfoField {...formikCheckboxProps} />)
    expect(component.find(Checkbox).props()).toMatchObject({
      checked: true,
      name: 'addTechnicalInfo',
      onChange: expect.any(Function),
      type: 'checkbox'
    })
  })

  it('calls onChange on checkbox change event', () => {
    const component = shallow(<ErrorReportAddTechInfoField {...formikCheckboxProps} />)
    const onChange = component.find(Checkbox).props().onChange
    onChange(null, { name: 'test', checked: true })
    expect(formikCheckboxProps.formik.setFieldValue).toHaveBeenCalled()
  })
})
