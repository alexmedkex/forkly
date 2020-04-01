import * as React from 'react'
import { shallow } from 'enzyme'
import { Modal } from 'semantic-ui-react'
import SubmitStatus from './SubmitStatus'
import { LoadingTransition, ErrorMessage } from '../../../../components'
import * as renderer from 'react-test-renderer'
import { render } from '@testing-library/react'

describe('SubmitStatus Component', () => {
  // TODO : Define strict type for the props
  // See: https://gitlab.com/ConsenSys/client/uk/KomGo/komgo-member-client/merge_requests/910#669d6a69505255560a98b4f10bb3b91c3410cde7
  let defaultProps

  beforeEach(() => {
    defaultProps = {
      open: true,
      isSubmitting: false,
      etrmId: 'sellerEtrmId',
      error: null,
      submit: jest.fn(),
      cancelSubmit: jest.fn()
    }
  })

  it('should render SubmitStatus component successfully', () => {
    const wrapper = shallow(<SubmitStatus {...defaultProps} />)

    expect(wrapper.exists()).toBe(true)
  })

  it('should call cancelSubmit when button for submit is pressed', () => {
    const wrapper = shallow(<SubmitStatus {...defaultProps} />)

    const button = wrapper
      .find(Modal.Actions)
      .shallow()
      .find({ 'data-test-id': 'cancel-button' })

    button.simulate('click')

    expect(defaultProps.cancelSubmit).toHaveBeenCalled()
  })

  // TODO: Replace with snapshot test once formik error resolved.
  it('should find loading component when isSubmitting is true', () => {
    const wrapper = shallow(<SubmitStatus {...defaultProps} isSubmitting={true} />)

    const loader = wrapper.find(LoadingTransition)

    expect(loader.exists()).toBe(true)
  })

  it('renders correctly', () => {
    expect(render(<SubmitStatus {...defaultProps} />).asFragment()).toMatchSnapshot()
  })

  it('should find error component when error is not undefined', () => {
    const wrapper = shallow(<SubmitStatus {...defaultProps} error="Test" />)

    const error = wrapper.find(ErrorMessage)

    expect(error.exists()).toBe(true)
  })
})
