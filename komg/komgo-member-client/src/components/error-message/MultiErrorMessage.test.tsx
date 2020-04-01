import * as React from 'react'
import { shallow } from 'enzyme'
import { MultiErrorMessage, Button, Error } from './MultiErrorMessage'
import * as renderer from 'react-test-renderer'

describe('MultiErrorMessage component', () => {
  let defaultProps

  beforeEach(() => {
    defaultProps = {
      title: 'Error',
      messages: ['Error1', 'Error2', 'Error3', 'Error4']
    }
  })

  it('Should render compoent successfully', () => {
    const wrapper = shallow(<MultiErrorMessage {...defaultProps} />)

    expect(wrapper.exists()).toBe(true)
  })
  it('Should match snapshot', () => {
    const tree = renderer.create(<MultiErrorMessage {...defaultProps} />).toJSON()

    expect(tree).toMatchSnapshot()
  })
  it('Should find button for see all errors', () => {
    const wrapper = shallow(<MultiErrorMessage {...defaultProps} />)

    const button = wrapper.find(Button).shallow()

    expect(button.text()).toBe('More')
  })

  it('Should find 3 error messages', () => {
    const wrapper = shallow(<MultiErrorMessage {...defaultProps} />)

    const errors = wrapper.find(Error)

    expect(errors.length).toBe(3)
  })
  it('Should find button for see less errors', () => {
    const wrapper = shallow(<MultiErrorMessage {...defaultProps} />)

    wrapper.setState({ open: true })
    const button = wrapper.find(Button).shallow()

    expect(button.text()).toBe('Less')
  })
  it('Should find 4 error messages', () => {
    const wrapper = shallow(<MultiErrorMessage {...defaultProps} />)

    wrapper.setState({ open: true })
    const errors = wrapper.find(Error)

    expect(errors.length).toBe(4)
  })
  it('Should find 0 buttons if messages length is 1', () => {
    const wrapper = shallow(<MultiErrorMessage {...defaultProps} messages={['Test1']} />)

    const button = wrapper.find(Button)

    expect(button.length).toBe(0)
  })
  it('Should find 1 error messages', () => {
    const wrapper = shallow(<MultiErrorMessage {...defaultProps} messages={['Test1']} />)

    const errors = wrapper.find(Error)

    expect(errors.length).toBe(1)
  })
})
