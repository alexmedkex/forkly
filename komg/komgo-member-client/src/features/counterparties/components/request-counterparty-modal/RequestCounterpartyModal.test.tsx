import * as React from 'react'
import { shallow } from 'enzyme'
import RequestCounterpartyModal from './RequestCounterpartyModal'

describe('RequestCounterpartyModal component', () => {
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
    const wrapper = shallow(<RequestCounterpartyModal {...defaultProps} />)

    expect(wrapper.exists()).toBe(true)
  })

  it('should render 3 buttons when modal is open', () => {
    const wrapper = shallow(<RequestCounterpartyModal {...defaultProps} open={true} />)

    expect(wrapper.find('Button').length).toBe(3)
  })

  it('should call handleModalOpen with false when cancel is pressed', () => {
    const wrapper = shallow(<RequestCounterpartyModal {...defaultProps} open={true} />)

    wrapper
      .find('Button')
      .at(0)
      .simulate('click')

    expect(defaultProps.actionCallback).toHaveBeenCalledWith(false)
  })

  it('should call handleResponseOnRequest with company id and false when reject is pressed', () => {
    const wrapper = shallow(<RequestCounterpartyModal {...defaultProps} open={true} />)

    wrapper
      .find('Button')
      .at(1)
      .simulate('click')

    expect(defaultProps.handleResponseOnRequest).toHaveBeenCalledWith('123', false)
  })

  it('should call handleResponseOnRequest with company id and true when approve is pressed', () => {
    const wrapper = shallow(<RequestCounterpartyModal {...defaultProps} open={true} />)

    wrapper
      .find('Button')
      .at(2)
      .simulate('click')

    expect(defaultProps.handleResponseOnRequest).toHaveBeenCalledWith('123', true)
  })
})
