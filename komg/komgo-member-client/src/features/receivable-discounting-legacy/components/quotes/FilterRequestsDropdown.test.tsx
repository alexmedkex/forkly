import React from 'react'
import renderer from 'react-test-renderer'
import FilterReceivablesDiscountingRequestsDropdown, {
  IFilterRequestsDropdownProps,
  StyledDropdown
} from './FilterRequestsDropdown'
import { shallow } from 'enzyme'
import { mapAndFilterToDropdown } from '../../selectors/quotesTableSelectors'
import { enumToDropdownOptions } from '../../../letter-of-credit-legacy/components'
import { ParticipantRFPStatus } from '@komgo/types'

const defaultProps: IFilterRequestsDropdownProps = {
  onChange: jest.fn(),
  options: [
    {
      text: 'All quotes',
      value: 'ALL',
      content: 'All quotes'
    }
  ]
}

describe('FilterRequestsDropdown', () => {
  it('renders correctly', () => {
    // TODO: check this snapshot since it depend on komgo-types
    const options = mapAndFilterToDropdown(enumToDropdownOptions(ParticipantRFPStatus))
    const tree = renderer
      .create(<FilterReceivablesDiscountingRequestsDropdown {...defaultProps} options={options} />)
      .toJSON()

    expect(tree).toMatchSnapshot()
  })

  it('calls on change when changed', () => {
    const wrapper = shallow(<FilterReceivablesDiscountingRequestsDropdown {...defaultProps} />)

    const dropdown = wrapper.find(StyledDropdown)
    const data = {}
    dropdown.props().onChange(undefined, data)

    expect(defaultProps.onChange).toHaveBeenCalledWith(data)
  })

  it('passes options to dropdown', () => {
    const options = [{ value: 'test' } as any]
    const wrapper = shallow(<FilterReceivablesDiscountingRequestsDropdown {...defaultProps} options={options} />)

    const dropdown = wrapper.find(StyledDropdown)

    expect(dropdown.props().options).toBe(options)
  })
})
