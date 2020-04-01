import * as React from 'react'
import { shallow } from 'enzyme'
import * as renderer from 'react-test-renderer'
import DeleteTradeConfirm from './DeleteTradeConfirm'
import { Modal, Button } from 'semantic-ui-react'
import { LoadingTransition, ErrorMessage } from '../../../../components'

describe('DeleteTradeConfirm component', () => {
  let defaultProps
  beforeEach(() => {
    defaultProps = {
      open: true,
      tradeId: '123',
      error: undefined,
      isDeleting: false,
      cancel: jest.fn(),
      confirm: jest.fn()
    }
  })

  it('should render component successfully', () => {
    const wrapper = shallow(<DeleteTradeConfirm {...defaultProps} />)

    expect(wrapper.exists()).toBe(true)
  })

  it('should render lodaing in modal content', () => {
    const wrapper = shallow(<DeleteTradeConfirm {...defaultProps} isDeleting={true} />)

    const modalContent = wrapper.find(Modal.Content).shallow()
    const loading = modalContent.find(LoadingTransition)

    expect(loading.exists()).toBe(true)
  })

  it('should render error in modal content', () => {
    const wrapper = shallow(<DeleteTradeConfirm {...defaultProps} error="Test" />)

    const modalContent = wrapper.find(Modal.Content).shallow()
    const error = modalContent.find(ErrorMessage)

    expect(error.exists()).toBe(true)
  })

  it('should disable buttons while waitign for response', () => {
    const wrapper = shallow(<DeleteTradeConfirm {...defaultProps} isDeleting={true} />)

    const modalActions = wrapper.find(Modal.Actions).shallow()
    const buttons = modalActions.find(Button)

    expect(buttons.first().prop('disabled')).toBe(true)
    expect(buttons.at(1).prop('disabled')).toBe(true)
  })

  it('should call cancel when cancel button is clicked', () => {
    const wrapper = shallow(<DeleteTradeConfirm {...defaultProps} />)

    const modalActions = wrapper.find(Modal.Actions).shallow()
    const cancelButton = modalActions.find(Button).first()
    cancelButton.simulate('click')

    expect(defaultProps.cancel).toHaveBeenCalled()
  })

  it('should call confirm when confirm button is clicked', () => {
    const wrapper = shallow(<DeleteTradeConfirm {...defaultProps} />)

    const modalActions = wrapper.find(Modal.Actions).shallow()
    const confirmButton = modalActions.find(Button).at(1)
    confirmButton.simulate('click')

    expect(defaultProps.confirm).toHaveBeenCalled()
  })
})
