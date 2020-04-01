import * as React from 'react'
import { shallow } from 'enzyme'
import ResendCounterpartyModal from './ResendCounterpartyModal'

describe('ResendCounterpartyModal component', () => {
  let defaultProps: any

  beforeEach(() => {
    defaultProps = {
      open: false,
      companyName: 'Company 1',
      companyId: '123',
      handleModalOpen: jest.fn(),
      handleResponseOnRequest: jest.fn(),
      actionCallback: jest.fn()
    }
  })

  it('should render RequestCounterpartyModal successfully', () => {
    const wrapper = shallow(<ResendCounterpartyModal {...defaultProps} />)

    expect(wrapper.exists()).toBe(true)
  })

  it('should render 2 buttons when modal is open', () => {
    const wrapper = shallow(<ResendCounterpartyModal {...defaultProps} open={true} />)

    expect(wrapper.find('Button').length).toBe(2)
  })

  it('should call handleModalOpen with false when cancel is pressed', () => {
    const wrapper = shallow(<ResendCounterpartyModal {...defaultProps} open={true} />)

    wrapper
      .find('Button')
      .at(0)
      .simulate('click')

    expect(defaultProps.actionCallback).toHaveBeenCalledWith(false)
  })

  it('should call handleResponseOnRequest with company id when resend is pressed', () => {
    const wrapper = shallow(<ResendCounterpartyModal {...defaultProps} open={true} />)

    wrapper
      .find('Button')
      .at(1)
      .simulate('click')

    expect(defaultProps.handleResponseOnRequest).toHaveBeenCalledWith('123')
  })
})
