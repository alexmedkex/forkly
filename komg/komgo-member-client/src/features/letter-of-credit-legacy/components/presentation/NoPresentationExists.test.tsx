import * as React from 'react'
import { shallow } from 'enzyme'
import { Button } from 'semantic-ui-react'
import NoPresentationExists from './NoPresentationExists'

describe('AddDocumentButton component', () => {
  let defaultProps

  beforeEach(() => {
    defaultProps = {
      callback: jest.fn()
    }
  })

  it('should render component successfully', () => {
    const wrapper = shallow(<NoPresentationExists {...defaultProps} />)

    expect(wrapper.exists()).toBe(true)
  })

  it('should call callback function when button for adding presentation is clicked', () => {
    const wrapper = shallow(<NoPresentationExists {...defaultProps} />)

    const button = wrapper.find(Button)
    button.simulate('click')

    expect(defaultProps.callback).toHaveBeenCalled()
  })
})
