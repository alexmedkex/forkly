import * as React from 'react'
import * as renderer from 'react-test-renderer'
import moment from 'moment'
import RedTimer from './RedTimer'

describe('RedTimer component', () => {
  let defaultProps
  beforeEach(() => {
    defaultProps = {
      leftMinutes: 1000,
      dueDateMoment: moment(1553431046787 + 60000)
    }
  })

  it('should match snapshot when there are more thant 60 minutes', () => {
    const tree = renderer.create(<RedTimer {...defaultProps} />).toJSON()

    expect(tree).toMatchSnapshot()
  })

  it('should match snapshot when there are less than 60 minutes', () => {
    const props = {
      leftMinutes: 50,
      dueDateMoment: moment(1553431046787 + 300)
    }

    const tree = renderer.create(<RedTimer {...props} />).toJSON()

    expect(tree).toMatchSnapshot()
  })
})
