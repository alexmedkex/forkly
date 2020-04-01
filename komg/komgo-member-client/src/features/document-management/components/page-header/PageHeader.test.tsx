import * as React from 'react'
import { shallow } from 'enzyme'

import mockCounterparties from '../../../counterparties/store/mockData'
import { mockCategories } from '../../store/categories/mock-data'
import { mockDocuments } from '../../store/documents/mock-data'
import { initialDocumentsFilters } from '../../store/documents/reducer'

import {
  PageHeader,
  DocumentListPageHeader,
  LOCDocsHeader,
  CounterpartyDocsHeader,
  PageHeaderProps,
  DocumentListPageHeaderProps,
  LOCDocsHeaderProps,
  CounterpartyDocsHeaderProps
} from './PageHeader'

describe('PageHeader component', () => {
  const pageHeaderProps: PageHeaderProps = {
    pageName: 'Test Page',
    handleSearch: jest.fn(),
    isLoading: true,
    disabledSearch: false
    // selectedDocuments: [],
    // renderHeaderDropdown: jest.fn(),
    // renderHeaderButton: jest.fn(),
    // toggleShareDocumentModal: jest.fn(),
    // downloadSelectedDocuments: jest.fn()
  }
  it('should render PageHeader successfully', () => {
    const wrapper = shallow(<PageHeader {...pageHeaderProps} />)

    expect(wrapper.exists()).toBe(true)
  })

  it('should find page name', () => {
    const wrapper = shallow(<PageHeader {...pageHeaderProps} />)

    expect(
      wrapper
        .find('Header')
        .shallow()
        .text()
    ).toBe('Test Page')
  })
})

describe('DocumentListPageHeader component', () => {
  const DListPageHeaderProps: DocumentListPageHeaderProps = {
    counterparties: mockCounterparties.counterparties,
    disabledSearch: false,
    categories: mockCategories,
    types: [],
    isLoading: false,
    selectedDocuments: mockDocuments,
    filters: initialDocumentsFilters,
    userCanCrudAndShareDocs: true,
    handleSearch: jest.fn(),
    toggleShareDocumentModal: jest.fn(),
    toggleAddDocumentModal: jest.fn(),
    toggleAddDocumentTypeModal: jest.fn(),
    downloadSelectedDocuments: jest.fn(),
    changeDocumentsFilter: jest.fn(),
    pageName: 'anon',
    filter: {},
    onFilterApplied: jest.fn()
  }
  it('should render DocumentListPageHeader successfully', () => {
    const wrapper = shallow(<DocumentListPageHeader {...DListPageHeaderProps} />)

    expect(wrapper.exists()).toBe(true)
  })

  it('should find DocumentListPageHeader', () => {
    const wrapper = shallow(<DocumentListPageHeader {...DListPageHeaderProps} />)

    expect(
      wrapper
        .find('Header')
        .shallow()
        .text()
    ).toBe('anon')
  })
})

describe('LOCDocsHeader component', () => {
  const LOCDocsHeaderProps: LOCDocsHeaderProps = {
    pageName: 'LOCHeader',
    disabledSearch: false,
    handleSearch: jest.fn(),
    renderHeaderButton: jest.fn()
  }
  it('should render LOCDocsHeader successfully', () => {
    const wrapper = shallow(<LOCDocsHeader {...LOCDocsHeaderProps} />)

    expect(wrapper.exists()).toBe(true)
  })

  it('should find LOCDocsHeader', () => {
    const wrapper = shallow(<LOCDocsHeader {...LOCDocsHeaderProps} />)

    expect(
      wrapper
        .find('Header')
        .shallow()
        .text()
    ).toBe('LOCHeader')
  })
})

describe('CounterpartyDocsHeader component', () => {
  const CounterpartyDocsHeaderProps: CounterpartyDocsHeaderProps = {
    pageName: 'CPDocsHeader',
    disabledSearch: false,
    isLoading: false,
    selectedDocuments: mockDocuments,
    categories: mockCategories,
    types: [],
    users: [],
    filters: initialDocumentsFilters,
    filter: null,
    userCanCreateRequest: true,
    handleSearch: jest.fn(),
    toggleNewDocumentRequestModal: jest.fn(),
    toggleLoadDocumentRequestTemplateModal: jest.fn(),
    downloadSelectedDocuments: jest.fn(),
    changeDocumentsFilter: jest.fn(),
    onFilterApplied: jest.fn()
  }
  it('should render CounterpartyDocsHeader successfully', () => {
    const wrapper = shallow(<CounterpartyDocsHeader {...CounterpartyDocsHeaderProps} />)

    expect(wrapper.exists()).toBe(true)
  })

  it('should find CounterpartyDocsHeader', () => {
    const wrapper = shallow(<CounterpartyDocsHeader {...CounterpartyDocsHeaderProps} />)

    expect(
      wrapper
        .find('Header')
        .shallow()
        .text()
    ).toBe('CPDocsHeader')
  })
})
