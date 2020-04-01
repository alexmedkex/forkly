import { mount } from 'enzyme'
import * as React from 'react'
import { MemoryRouter as Router } from 'react-router-dom'
import LeavingPageConfirmation, { IProps } from './LeavingPageConfirmation'

const defaultProps: IProps = {
  when: true,
  message: 'message'
}

describe('LeavingPageConfirmation', () => {
  it('should render component successfully', () => {
    const component = mount(
      <Router>
        <LeavingPageConfirmation {...defaultProps} />
      </Router>
    )

    expect(component.exists()).toBeTruthy()
  })

  it('should render Prompt successfully', () => {
    const component = mount(
      <Router>
        <LeavingPageConfirmation {...defaultProps} />
      </Router>
    )

    expect(component.find('Prompt').exists()).toBeTruthy()
  })

  it('should call handleBeforeUnload when beforeunload triggered', () => {
    const component = mount(
      <Router>
        <LeavingPageConfirmation {...defaultProps} />
      </Router>
    )
    const instance = component.find(LeavingPageConfirmation).instance() as LeavingPageConfirmation
    const spy = jest.spyOn(instance, 'handleBeforeUnload')

    instance.forceUpdate()
    window.dispatchEvent(new Event('beforeunload'))
    expect(spy).toHaveBeenCalled()
  })

  it('should NOT call handleBeforeUnload when beforeunload triggered', () => {
    const newProps = {
      ...defaultProps,
      when: false
    }
    const component = mount(
      <Router>
        <LeavingPageConfirmation {...newProps} />
      </Router>
    )
    const instance = component.find(LeavingPageConfirmation).instance() as LeavingPageConfirmation
    const spy = jest.spyOn(instance, 'handleBeforeUnload')

    instance.forceUpdate()
    window.dispatchEvent(new Event('beforeunload'))
    expect(spy).not.toHaveBeenCalled()
  })
})
