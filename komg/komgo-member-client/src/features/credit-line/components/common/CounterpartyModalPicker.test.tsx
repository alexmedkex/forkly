import * as React from 'react'
import { shallow } from 'enzyme'

import CounterpartyModalPicker, { CompanyTableItem } from './CounterpartyModalPicker'
import { fakeMember } from '../../../letter-of-credit-legacy/utils/faker'

const defaultCompanyItem: CompanyTableItem = {
  name: 'Applicant Name',
  countryName: 'Serbia',
  country: 'rs',
  location: 'city',
  id: 'cf63c1f8-1165-4c94-a8f8-9252eb4f0016'
}

describe('CounterpartyModalPicker', () => {
  let defaultProps

  beforeEach(() => {
    defaultProps = {
      members: [{ ...fakeMember({ country: 'RS' }), disabled: false }],
      title: 'Select a buyer',
      counterpartyTablePrint: 'Buyer',
      onNext: jest.fn(),
      renderButton: jest.fn()
    }
  })

  it('should render successfully', () => {
    const wrapper = shallow(<CounterpartyModalPicker {...defaultProps} />)

    expect(wrapper.exists()).toBe(true)
  })

  it('should calculate appropriate first state', () => {
    const wrapper = shallow(<CounterpartyModalPicker {...defaultProps} />)

    expect(wrapper.state()).toEqual({
      companies: [defaultCompanyItem],
      open: false,
      tableRowConfig: new Map([['cf63c1f8-1165-4c94-a8f8-9252eb4f0016', {}]]),
      selectedCounterparties: []
    })
  })

  it('table should have selectable prop to false per default', () => {
    const wrapper = shallow(<CounterpartyModalPicker {...defaultProps} />)

    const table = wrapper
      .find('WithSearchInput')
      .shallow()
      .find('Table')

    expect(table.prop('selectable')).toBe(false)
  })

  it('table should have selectable prop to true if multipleSelection is true', () => {
    const wrapper = shallow(<CounterpartyModalPicker {...defaultProps} multipleSelection={true} />)

    const table = wrapper
      .find('WithSearchInput')
      .shallow()
      .find('Table')

    expect(table.prop('selectable')).toBe(true)
    expect(table.prop('onRowClick')).toBe(undefined)
  })

  it('should reset state once cancel is clicked', () => {
    const wrapper = shallow(<CounterpartyModalPicker {...defaultProps} />)
    wrapper.setState({
      open: true,
      selectedCounterparties: ['123']
    })

    const cancelButton = wrapper.find('[data-test-id="select-modal"]').find('[data-test-id="cancel-button"]')

    cancelButton.simulate('click')

    expect(wrapper.state('open')).toBe(false)
    expect(wrapper.state('selectedCounterparties')).toEqual([])
  })

  it('next button should be disabled per default', () => {
    const wrapper = shallow(<CounterpartyModalPicker {...defaultProps} />)

    const nextButton = wrapper.find('[data-test-id="select-modal"]').find('[data-test-id="next-button"]')

    expect(nextButton.prop('disabled')).toBe(true)
  })

  it('should call onNext with selected counterparty id when next button is clicked', () => {
    const wrapper = shallow(<CounterpartyModalPicker {...defaultProps} />)
    wrapper.setState({
      open: true,
      selectedCounterparties: ['123']
    })

    const nextButton = wrapper.find('[data-test-id="select-modal"]').find('[data-test-id="next-button"]')

    nextButton.simulate('click')

    expect(defaultProps.onNext).toHaveBeenCalledWith('123')
  })

  it('should call onNext with array of selected counterparies id when next button is clicked if multipleSelection is true', () => {
    const wrapper = shallow(<CounterpartyModalPicker {...defaultProps} multipleSelection={true} />)
    wrapper.setState({
      open: true,
      selectedCounterparties: ['123']
    })

    const nextButton = wrapper.find('[data-test-id="select-modal"]').find('[data-test-id="next-button"]')

    nextButton.simulate('click')

    expect(defaultProps.onNext).toHaveBeenCalledWith(['123'])
  })

  it('should set appropriate companies in state once search has changed - handleSearchChanged is called', () => {
    const wrapper = shallow(<CounterpartyModalPicker {...defaultProps} />)

    const instance = wrapper.instance() as CounterpartyModalPicker

    instance.handleSearchChanged('test')

    expect(wrapper.state('companies')).toEqual([])
  })

  it('should set selected counterparty in state when handleSelectCounterparty is called', () => {
    const wrapper = shallow(<CounterpartyModalPicker {...defaultProps} />)

    const instance = wrapper.instance() as CounterpartyModalPicker

    instance.handleSelectCounterparty(defaultCompanyItem)

    expect(wrapper.state('selectedCounterparties')).toEqual([defaultCompanyItem.id])
    expect(wrapper.state('tableRowConfig')).toEqual(
      new Map([['cf63c1f8-1165-4c94-a8f8-9252eb4f0016', { highlighted: true }]])
    )
  })
})
