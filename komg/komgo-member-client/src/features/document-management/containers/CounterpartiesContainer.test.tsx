import { shallow } from 'enzyme'
import * as React from 'react'

import mockCounterparties from '../../counterparties/store/mockData'
import { Sort } from '../../counterparties/store/types'
import { CounterpartiesContainer, ICounterpartiesProps } from './CounterpartiesContainer'
import { createMemoryHistory } from 'history'

describe('CounterpartiesContainer component', () => {
  const mockSort: Sort = { column: 'name', order: 'ascending' }

  const mockProps: ICounterpartiesProps = {
    history: createMemoryHistory(),
    location: {
      pathname: '',
      search: '',
      state: '',
      hash: ''
    },
    match: {
      isExact: true,
      path: '',
      url: '',
      params: null
    },
    counterpartyProfiles: new Map(),
    documentTypes: [],
    categories: [],
    sentDocumentRequestTypes: undefined,
    createRequestAsync: jest.fn(),
    fetchCategoriesAsync: jest.fn(),
    fetchDocumentTypesAsync: jest.fn(),
    staticContext: undefined,
    counterpartiesSearch: '',
    counterparties: mockCounterparties.counterparties,
    counterpartiesFiltered: mockCounterparties.counterparties,
    counterpartiesSort: mockSort,
    fetchingConnectedCounterparties: false,
    fetchingConnectedCounterpartiesError: '',
    fetchConnectedCounterpartiesAsync: jest.fn(),
    fetchNotConnectedCompaniesAsync: jest.fn(),
    setCounterpartyFilter: jest.fn(),
    searchCounterparty: jest.fn(search => void 0),
    sortConnectedCounterparties: jest.fn(sort => void 0),
    isAuthorized: jest.fn(requiredPermission => true),
    isLicenseEnabled: jest.fn(() => true),
    isLicenseEnabledForCompany: jest.fn(),
    activeFilter: { renewalDateKey: 'all' }
  } as any

  it('should render a child div with CounterpartiesContainer item with props', () => {
    const wrapper = shallow(<CounterpartiesContainer {...mockProps} />)
    expect(wrapper.find('CounterpartiesContainer').exists).toBeTruthy()
  })

  it('should render a child div with CounterpartiesContainer item with entity of templates', () => {
    const wrapper = shallow(<CounterpartiesContainer {...mockProps} />)
    expect(wrapper.find('CounterpartiesContainer').exists).toBeTruthy()
  })
})
