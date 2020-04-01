import { shallow } from 'enzyme'
import * as React from 'react'
import { Formik } from 'formik'

jest.mock('../../../utils/zendesk-storage', () => ({
  ZendeskStorage: {
    error: null,
    requests: [],
    user: {}
  }
}))

import { ErrorReportForm } from './ErrorReportForm'
import { ErrorReportSeverity } from '../store/types'

const props: any = {
  isFetching: false,
  location: { hash: '' },
  createTicket: jest.fn()
}

describe('ErrorReportForm', () => {
  it('renders Formik', () => {
    const component = shallow(<ErrorReportForm {...props} />)
    expect(component.find('Formik').props()).toMatchObject({
      initialValues: {
        subject: '',
        description: '',
        stepsToReproduce: '',
        addTechnicalInfo: true,
        technicalInfo: expect.stringContaining('Technical Error'),
        uploads: {},
        severity: ErrorReportSeverity['3 - Medium']
      },
      onSubmit: expect.any(Function),
      render: expect.any(Function)
    })
  })

  it('should createTicket()', () => {
    const component = shallow(<ErrorReportForm {...props} />)
    const onSubmit = component.find('Formik').props().onSubmit
    onSubmit({} as any)
    expect(props.createTicket).toHaveBeenCalled()
  })

  it('should handle submit', () => {
    const component = shallow(<ErrorReportForm {...props} />)
    const render = component.find(Formik).props().render
    const mockSubmit = jest.fn()
    const form: any = render({ handleSubmit: mockSubmit } as any)
    const onSubmit = form.props.onSubmit
    onSubmit()
    expect(mockSubmit).toHaveBeenCalled()
  })
})
