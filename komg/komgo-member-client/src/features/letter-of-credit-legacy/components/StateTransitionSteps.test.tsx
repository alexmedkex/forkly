import * as React from 'react'
import { shallow } from 'enzyme'
import StateTransitionSteps from './StateTransitionSteps'

describe('StateTransitionSteps component', () => {
  const defaultProps = {
    stateHistory: [
      {
        performerName: 'Shell',
        fromState: '1',
        toState: '2',
        performer: '17721',
        date: '21-10-1991'
      }
    ]
  }
  it('should render component successfully', () => {
    const wrapper = shallow(<StateTransitionSteps {...defaultProps} />)

    expect(wrapper.exists()).toBe(true)
  })
})
