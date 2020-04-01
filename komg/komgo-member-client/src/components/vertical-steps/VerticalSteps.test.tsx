import * as React from 'react'
import { shallow } from 'enzyme'
import VerticalSteps, { Step } from './VerticalSteps'

describe('Vertical Steps', () => {
  let defaultProps: any

  beforeEach(() => {
    defaultProps = {
      steps: [
        {
          title: 'Title',
          subtitle: 'Subtitle',
          date: '10-10-2018',
          description: 'Test'
        }
      ]
    }
  })
  it('Should render VerticalSteps component successfully', () => {
    const wrapper = shallow(<VerticalSteps {...defaultProps} />)

    expect(wrapper.exists()).toBe(true)
  })
  it('Should found one step', () => {
    const wrapper = shallow(<VerticalSteps {...defaultProps} />)

    expect(wrapper.find(Step).length).toBe(1)
  })
})
