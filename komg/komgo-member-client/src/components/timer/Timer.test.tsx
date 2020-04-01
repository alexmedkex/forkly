import * as React from 'react'
import { shallow } from 'enzyme'
import Timer from './Timer'
import moment from 'moment'

describe('Timer', () => {
  let defaultProps

  beforeEach(() => {
    Date.now = jest.fn(() => 1553431046787)
    jest.useFakeTimers()
    defaultProps = {
      dueDate: '2019-03-24T18:26:22.561Z',
      render: jest.fn()
    }
  })

  it('should count leftMinutes properly', () => {
    const wrapper = shallow(<Timer {...defaultProps} />)

    expect(wrapper.state('leftMinutes')).toBe(348)
    expect(wrapper.state('dueDateMoment')).toEqual(moment(defaultProps.dueDate))
  })

  it('should call render props function with appropriate params', () => {
    const wrapper = shallow(<Timer {...defaultProps} />)

    expect(defaultProps.render).toHaveBeenCalledWith(wrapper.state('dueDateMoment'), wrapper.state('leftMinutes'))
  })

  it('should call setInterval per default', () => {
    const wrapper = shallow(<Timer {...defaultProps} />)

    expect(setInterval).toHaveBeenCalled()
  })

  it('should not call setInterval when static is true', () => {
    const wrapper = shallow(<Timer {...defaultProps} static={true} />)

    expect(setInterval).not.toHaveBeenCalled()
  })

  it('should count leftMinutes', () => {
    const wrapper = shallow(<Timer {...defaultProps} />)

    // Mock Date.now() to add one minute
    Date.now = jest.fn(() => 1553431046787 + 60000)

    jest.runOnlyPendingTimers()

    expect(wrapper.state('leftMinutes')).toBe(347)
  })

  it('should call render again', () => {
    const wrapper = shallow(<Timer {...defaultProps} />)

    // Mock Date.now() to add one minute
    Date.now = jest.fn(() => 1553431046787 + 60000)

    jest.runOnlyPendingTimers()

    expect(defaultProps.render).toHaveBeenLastCalledWith(wrapper.state('dueDateMoment'), wrapper.state('leftMinutes'))
  })
})
