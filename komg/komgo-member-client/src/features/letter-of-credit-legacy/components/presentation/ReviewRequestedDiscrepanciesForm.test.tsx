import * as React from 'react'
import { shallow } from 'enzyme'
import ReviewRequestedDiscrepanciesForm from './ReviewRequestedDiscrepanciesForm'

describe('ReviewRequestedDiscrepanciesForm', () => {
  let defaultProps

  beforeEach(() => {
    defaultProps = {
      isSubmittingResponse: false,
      close: jest.fn(),
      submit: jest.fn()
    }
  })

  it('should render successfully', () => {
    const wrapper = shallow(<ReviewRequestedDiscrepanciesForm {...defaultProps} />)

    expect(wrapper.exists()).toBe(true)
  })

  it('accept discrepancies should be set per default', () => {
    const wrapper = shallow(<ReviewRequestedDiscrepanciesForm {...defaultProps} />)

    const radioButtonAccept = wrapper.find({ 'data-test-id': 'response-accept' })

    expect(radioButtonAccept.props().checked).toBe(true)
  })

  it('reject discrepancies should not be set per default', () => {
    const wrapper = shallow(<ReviewRequestedDiscrepanciesForm {...defaultProps} />)

    const radioButtonReject = wrapper.find({ 'data-test-id': 'response-reject' })

    expect(radioButtonReject.props().checked).toBe(false)
  })

  it('should set state to be Reject when reject radio button is clicked', () => {
    const wrapper = shallow(<ReviewRequestedDiscrepanciesForm {...defaultProps} />)

    const radioButtonReject = wrapper.find({ 'data-test-id': 'response-reject' })

    radioButtonReject.simulate('change', null, { value: 'Reject' })

    expect(wrapper.state('response')).toBe('Reject')
  })

  it('should set state to be Accept when accept radio button is clicked', () => {
    const wrapper = shallow(<ReviewRequestedDiscrepanciesForm {...defaultProps} />)
    wrapper.setState({
      response: 'Reject'
    })

    const radioButtonAccept = wrapper.find({ 'data-test-id': 'response-accept' })

    radioButtonAccept.simulate('change', null, { value: 'Accept' })

    expect(wrapper.state('response')).toBe('Accept')
  })

  it('should call submit with appropriate data', () => {
    const wrapper = shallow(<ReviewRequestedDiscrepanciesForm {...defaultProps} />)

    const data = {
      response: 'Reject',
      comment: 'Test'
    }

    wrapper.setState(data)

    const submitButton = wrapper.find({ 'data-test-id': 'submit' })

    submitButton.simulate('click')

    expect(defaultProps.submit).toHaveBeenCalledWith(data.response, data.comment)
  })

  it('should call close', () => {
    const wrapper = shallow(<ReviewRequestedDiscrepanciesForm {...defaultProps} />)

    const cancelButton = wrapper.find({ 'data-test-id': 'cancel' })

    cancelButton.simulate('click')

    expect(defaultProps.close).toHaveBeenCalled()
  })
})
