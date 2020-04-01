import * as React from 'react'
import { shallow } from 'enzyme'
import { Modal, Button } from 'semantic-ui-react'
import TraderAcceptQuoteSubmitConfirm from './TraderAcceptQuoteSubmitConfirm'
import { LoadingTransition, ErrorMessage } from '../../../../components'
import { ITraderAcceptQuoteSubmitConfirmProps } from './TraderAcceptQuoteSubmitConfirm'

describe('SubmitConfirm Component', () => {
  let defaultProps: ITraderAcceptQuoteSubmitConfirmProps

  beforeEach(() => {
    defaultProps = {
      open: true,
      error: undefined,
      isSubmitting: false,
      loadingText: 'Loading Text',
      actionText: <p>Test</p>,
      buttonText: 'Loading Text',
      title: 'Loading Text',
      cancelSubmit: jest.fn(),
      confirmSubmit: jest.fn()
    }
  })

  it('should render SubmitConfirm component successfully', () => {
    const wrapper = shallow(<TraderAcceptQuoteSubmitConfirm {...defaultProps} />)

    expect(wrapper.exists()).toBe(true)
  })

  it('should call submit when button for submit is pressed', () => {
    const wrapper = shallow(<TraderAcceptQuoteSubmitConfirm {...defaultProps} />)

    const buttons = wrapper
      .find(Modal.Actions)
      .first()
      .find(Button)
    buttons.at(1).simulate('click')

    expect(defaultProps.confirmSubmit).toHaveBeenCalled()
  })

  it('should call cancelSubmit when button for submit is pressed', () => {
    const wrapper = shallow(<TraderAcceptQuoteSubmitConfirm {...defaultProps} />)

    const buttons = wrapper
      .find(Modal.Actions)
      .first()
      .find(Button)
    buttons.at(0).simulate('click')

    expect(defaultProps.cancelSubmit).toHaveBeenCalled()
  })

  it('should find loading component when isSubmitting is true', () => {
    const wrapper = shallow(<TraderAcceptQuoteSubmitConfirm {...defaultProps} isSubmitting={true} />)

    const loader = wrapper.find(LoadingTransition)

    expect(loader.exists()).toBe(true)
  })

  it('should find error component when error is not undefined', () => {
    const wrapper = shallow(<TraderAcceptQuoteSubmitConfirm {...defaultProps} error="Test" />)

    const error = wrapper.find(ErrorMessage)

    expect(error.exists()).toBe(true)
  })
})
