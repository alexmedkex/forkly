import * as React from 'react'
import { shallow } from 'enzyme'
import { Modal, Button } from 'semantic-ui-react'
import SubmitConfirm from './SubmitConfirm'
import { fakeCounterparty } from '../../../../letter-of-credit-legacy/utils/faker'
import { LoadingTransition, ErrorMessage } from '../../../../../components'
import { ISubmitConfirmProps } from './SubmitConfirm'

describe('SubmitConfirm Component', () => {
  let defaultProps: ISubmitConfirmProps

  beforeEach(() => {
    defaultProps = {
      open: true,
      error: undefined,
      isSubmitting: false,
      counterparties: [fakeCounterparty()],
      submit: jest.fn(),
      cancelSubmit: jest.fn()
    }
  })

  it('should render SubmitConfirm component successfully', () => {
    const wrapper = shallow(<SubmitConfirm {...defaultProps} />)

    expect(wrapper.exists()).toBe(true)
  })

  it('should call submit when button for submit is pressed', () => {
    const wrapper = shallow(<SubmitConfirm {...defaultProps} />)

    const buttons = wrapper
      .find(Modal.Actions)
      .first()
      .find(Button)
    buttons.at(1).simulate('click')

    expect(defaultProps.submit).toHaveBeenCalled()
  })

  it('should call cancelSubmit when button for submit is pressed', () => {
    const wrapper = shallow(<SubmitConfirm {...defaultProps} />)

    const buttons = wrapper
      .find(Modal.Actions)
      .first()
      .find(Button)
    buttons.at(0).simulate('click')

    expect(defaultProps.cancelSubmit).toHaveBeenCalled()
  })

  it('should find loading component when isSubmitting is true', () => {
    const wrapper = shallow(<SubmitConfirm {...defaultProps} isSubmitting={true} />)

    const loader = wrapper.find(LoadingTransition)

    expect(loader.exists()).toBe(true)
  })

  it('should find error component when error is not undefined', () => {
    const wrapper = shallow(<SubmitConfirm {...defaultProps} error="Test" />)

    const error = wrapper.find(ErrorMessage)

    expect(error.exists()).toBe(true)
  })

  it('should print message for push to market with counterparties', () => {
    const wrapper = shallow(<SubmitConfirm {...defaultProps} />)

    const content = wrapper.find(Modal.Content).shallow()

    expect(content.text()).toContain('You are about to send a request for proposal to the following counterparties')
    expect(content.find('li').text()).toContain(defaultProps.counterparties[0].x500Name.CN)
  })
})
