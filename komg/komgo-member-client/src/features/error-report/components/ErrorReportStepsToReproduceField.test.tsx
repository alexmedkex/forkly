import { shallow } from 'enzyme'
import { TextArea } from 'semantic-ui-react'
import * as React from 'react'

import { ErrorReportStepsToReproduceField } from './ErrorReportStepsToReproduceField'
import { ErrorLabel } from '../../../components/error-message/ErrorLabel'

const formikProps: any = {
  formik: {
    values: {
      stepsToReproduce: 'stepsToReproduce'
    },
    errors: {
      stepsToReproduce: ''
    },
    touched: {
      stepsToReproduce: false
    },
    handleChange: jest.fn()
  }
}

describe('ErrorReportStepsToReproduceField', () => {
  beforeEach(() => {
    formikProps.formik.handleChange.mockClear()
  })

  it('renders TextArea', () => {
    const component = shallow(<ErrorReportStepsToReproduceField {...formikProps} />)
    expect(component.find(TextArea).props()).toMatchObject({
      as: 'textarea',
      name: 'stepsToReproduce',
      onChange: expect.any(Function),
      rows: '4',
      size: 'mini',
      value: 'stepsToReproduce'
    })
  })

  it('calls onChange on change event', () => {
    const component = shallow(<ErrorReportStepsToReproduceField {...formikProps} />)
    const onChange = component.find(TextArea).props().onChange
    onChange(null, { name: 'test', value: 'test' })
    expect(formikProps.formik.handleChange).toHaveBeenCalled()
  })

  it('renders ErrorLabel', () => {
    const withError = {
      formik: { ...formikProps.formik, errors: { stepsToReproduce: 'error' }, touched: { stepsToReproduce: true } }
    }
    const component = shallow(<ErrorReportStepsToReproduceField {...withError} />)
    const error = component.find(ErrorLabel)
    expect(error.length).toBe(1)
  })
})
