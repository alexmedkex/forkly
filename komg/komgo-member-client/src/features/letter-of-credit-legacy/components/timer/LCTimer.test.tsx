import * as React from 'react'
import { shallow } from 'enzyme'
import LCTimer, { TimerWrapper } from './LCTimer'
import moment from 'moment'

describe('LCViewTimer component', () => {
  let defaultProps
  beforeEach(() => {
    defaultProps = {
      leftMinutes: 2000,
      dueDateMoment: moment(1553431046787 + 120000)
    }
  })

  it('should find GreenTimer component when due date is more than a day and not find RedTimer', () => {
    const wrapper = shallow(<LCTimer {...defaultProps} />)

    const greenTimer = wrapper.find('GreenTimer')
    const redTimer = wrapper.find('RedTimer')

    expect(greenTimer.length).toBe(1)
    expect(redTimer.length).toBe(0)
  })

  it('should find RedTimer component when due date is less than a day and not find GreenTimer', () => {
    const wrapper = shallow(<LCTimer {...defaultProps} leftMinutes={1000} />)

    const greenTimer = wrapper.find('GreenTimer')
    const redTimer = wrapper.find('RedTimer')

    expect(greenTimer.length).toBe(0)
    expect(redTimer.length).toBe(1)
  })

  it('should not find timer when minutes left is minus', () => {
    const wrapper = shallow(<LCTimer {...defaultProps} leftMinutes={-100} />)

    const timerWrapper = wrapper.find(TimerWrapper)

    expect(timerWrapper.length).toBe(0)
  })

  it('should find timer expired text when minutes left is minus', () => {
    const wrapper = shallow(<LCTimer {...defaultProps} leftMinutes={-100} />)

    const timerWrapper = wrapper.find('TimerExpired')

    expect(timerWrapper.length).toBe(1)
  })
})
