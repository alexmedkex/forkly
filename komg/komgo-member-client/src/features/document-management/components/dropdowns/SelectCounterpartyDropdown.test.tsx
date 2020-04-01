import { shallow } from 'enzyme'
import * as React from 'react'
import { Dropdown } from 'semantic-ui-react'

import { initialDocumentsFilters } from '../../store/documents/reducer'
import * as mockCounterparties from '../../../counterparties/store/mockData'
import { Counterparty } from '../../../counterparties/store/types'
import { FILTERS_NAME } from '../../store/types/document'
import {
  SelectCounterpartyDropdown,
  counterpartiesToOptionsWithDefaults,
  getSharedWithText,
  Props
} from './SelectCounterpartyDropdown'

describe('SelectCounterpartyDropdown component', () => {
  const mockProps: Props = {
    disabled: false,
    counterparties: mockCounterparties.default.counterparties,
    filters: initialDocumentsFilters,
    onCounterpartySelect: jest.fn((filter: string, value: string) => void 0)
  }

  it('should render a SelectCounterpartyDropdown item with props', () => {
    const wrapper = shallow(<SelectCounterpartyDropdown {...mockProps} />)
    expect(wrapper.find('SelectCounterpartyDropdown').exists).toBeTruthy()
  })

  it('should call onCategorySelect onChange', () => {
    const wrapper = shallow(<SelectCounterpartyDropdown {...mockProps} />)
    const anonCounterpartyId = { value: 'anonCounterpartyId' }
    const sut = wrapper.find(Dropdown)

    sut.simulate('change', FILTERS_NAME.CATEGORY, anonCounterpartyId)
    expect(mockProps.onCounterpartySelect).lastCalledWith(FILTERS_NAME.COUNTERPARTY, 'anonCounterpartyId')
  })
})

describe('counterpartiesToOptionsWithDefaults', () => {
  it(`given an empty list of counterparties, returns default options:
     "All Counterparties", a disabled "Shared with"`, () => {
    const emptyCounterparties: Counterparty[] = []
    const actual = counterpartiesToOptionsWithDefaults(emptyCounterparties)

    expect(actual).toHaveLength(1)
  })
  it(`reduces a list of counterparties to: 
- the concat of the default DropdownOptions, 
- a <Divider/> 
- one Option per counterparty`, () => {
    const counterparties = mockCounterparties.default.counterparties
    const actual = counterpartiesToOptionsWithDefaults(counterparties)

    expect(actual).toHaveLength(3 + counterparties.length)
  })
})

describe('getSharedWithText', () => {
  it(`returns an empty string if given a string equal to 'none' or 'all_documents' or ''`, () => {
    const sut = getSharedWithText
    const actual = [sut(''), sut('none'), sut('all_documents')]
    const expected = ['', '', '']
    expect(actual).toEqual(expected)
  })

  it('otherwise returns "Shared with "', () => {
    const anonInput = 'foo'
    const expected = 'Shared with '
    expect(getSharedWithText(anonInput)).toEqual(expected)
  })
})
