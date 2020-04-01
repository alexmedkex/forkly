import * as React from 'react'
import * as renderer from 'react-test-renderer'
import moment from 'moment'
import TimerExpired from './TimerExpired'

describe('TimerExpired', () => {
  let defaultProps
  beforeEach(() => {
    defaultProps = {
      dueDateMoment: moment(1553431046787 - 60000)
    }
  })

  it('should match snapshot', () => {
    const tree = renderer.create(<TimerExpired {...defaultProps} />).toJSON()

    expect(tree).toMatchSnapshot()
  })
})
