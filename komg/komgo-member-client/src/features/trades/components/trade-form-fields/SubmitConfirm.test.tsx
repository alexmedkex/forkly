import * as React from 'react'
import { shallow } from 'enzyme'
import { Modal, Button } from 'semantic-ui-react'
import * as renderer from 'react-test-renderer'
import SubmitConfirm from './SubmitConfirm'
import { fakeTrade } from '../../../letter-of-credit-legacy/utils/faker'
import { LoadingTransition, ErrorMessage } from '../../../../components'
import { TRADING_ROLE_OPTIONS } from '../../constants'

describe('SubmitConfirm Component', () => {
  let defaultProps

  beforeEach(() => {
    defaultProps = {
      open: true,
      isSubmitting: false,
      isUploadingDocs: false,
      trade: fakeTrade(),
      role: TRADING_ROLE_OPTIONS.BUYER,
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

  it('should print message for create new trade', () => {
    const wrapper = shallow(<SubmitConfirm {...defaultProps} />)

    const content = wrapper.find(Modal.Content).shallow()

    expect(content.text()).toEqual('You are about to create a new trade.')
  })

  it('should print message for update trade', () => {
    const wrapper = shallow(<SubmitConfirm {...defaultProps} tradeId="123" />)

    const content = wrapper.find(Modal.Content).shallow()

    expect(content.text()).toEqual(`You are about to update trade ${defaultProps.trade.buyerEtrmId}.`)
  })
})
