import * as React from 'react'
import { shallow } from 'enzyme'
import AddCounterpartyModal, { StyledLoader } from './AddCounterpartyModal'
import { NotConnectedCounterparty } from '../../store/types'
import { fakeCounterparty } from '../../../letter-of-credit-legacy/utils/faker'

const notConnected: NotConnectedCounterparty[] = [
  fakeCounterparty({ staticId: '1', commonName: 'A Company' }) as NotConnectedCounterparty,
  fakeCounterparty({ staticId: '2', commonName: 'B Company' }) as NotConnectedCounterparty
]

describe('AddCounterpartyModal component', () => {
  let defaultProps: any

  beforeEach(() => {
    defaultProps = {
      open: false,
      fetching: false,
      error: null,
      counterparties: notConnected,
      addCounterparties: [],
      setAddCounterparties: jest.fn(),
      handleSearch: jest.fn(),
      handleModalOpen: jest.fn(),
      handleAddNewCounterparties: jest.fn()
    }
  })

  it('Should render AddCounterpartyModal', () => {
    const wrapper = shallow(<AddCounterpartyModal {...defaultProps} />)

    expect(wrapper.exists()).toBe(true)
  })

  it('Should call handleModalOpen with false param when cancel is clicked', () => {
    const wrapper = shallow(<AddCounterpartyModal {...defaultProps} />)

    wrapper
      .find('Button')
      .at(0)
      .simulate('click')

    expect(defaultProps.handleModalOpen).toHaveBeenCalledWith(false)
  })

  it('Add button should be disabled when addCounterparties props is empty array', () => {
    const wrapper = shallow(<AddCounterpartyModal {...defaultProps} />)

    expect(
      wrapper
        .find('Button')
        .at(1)
        .props().disabled
    ).toBe(true)
  })

  it('Should call setAddCounterparties with proper id when checkbox is clicked', () => {
    const wrapper = shallow(<AddCounterpartyModal {...defaultProps} />)

    wrapper
      .find('Checkbox')
      .at(0)
      .simulate('click')

    expect(defaultProps.setAddCounterparties).toHaveBeenCalledWith(['1'])
  })

  it('Should find two checkboxes', () => {
    const wrapper = shallow(<AddCounterpartyModal {...defaultProps} />)

    expect(wrapper.find('Checkbox').length).toBe(2)
  })

  it('Add button should be enabled when addCounterparties is not empty array', () => {
    const wrapper = shallow(<AddCounterpartyModal {...defaultProps} addCounterparties={['1']} />)

    expect(
      wrapper
        .find('Button')
        .at(1)
        .props().disabled
    ).toBe(false)
  })

  it('When add button is clicked it should call handleAddNewCounterparties with state', () => {
    const wrapper = shallow(<AddCounterpartyModal {...defaultProps} addCounterparties={['1']} />)

    wrapper
      .find('Button')
      .at(1)
      .simulate('click')

    expect(defaultProps.handleAddNewCounterparties).toHaveBeenCalledWith(['1'])
  })

  it('Should render loader while fetching', () => {
    const wrapper = shallow(<AddCounterpartyModal {...defaultProps} fetching={true} />)

    expect(wrapper.find(StyledLoader).length).toBe(1)
  })
})
