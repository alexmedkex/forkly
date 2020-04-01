import * as React from 'react'
import * as renderer from 'react-test-renderer'
import moment from 'moment-timezone'
import GreenTimer from './GreenTimer'

describe('GreenTimer component', () => {
  let defaultProps
  beforeEach(() => {
    moment.tz.guess = jest.fn(() => 'Europe/Belgrade')
    moment.tz.setDefault('Europe/Belgrade')
    Date.now = jest.fn(() => 1487076708000)
    defaultProps = {
      leftMinutes: 2000,
      dueDateMoment: moment(1553431046787 + 120000)
    }
  })

  afterEach(() => {
    moment.tz.setDefault()
  })

  it('should match snapshot', () => {
    const tree = renderer.create(<GreenTimer {...defaultProps} />).toJSON()

    expect(tree).toMatchSnapshot()
  })
})
