import { shallow } from 'enzyme'
import * as React from 'react'
import { SelectDocumentTypeSectionCard } from './SelectDocumentTypeSectionCard'
import * as renderer from 'react-test-renderer'

describe('SelectDocumentTypeSectionCard component', () => {
  const mockProps = {
    categories: [],
    documentTypes: [],
    selectedDocumentTypes: new Set<string>(),
    counterSelectedDoctypes: new Map(),
    toggleSelectionDocType: jest.fn()
  }
  it('should render an empty SectionCard item with props', () => {
    const wrapper = shallow(<SelectDocumentTypeSectionCard {...mockProps} />)
    expect(wrapper.find('SelectDocumentTypeSectionCard').exists).toBeTruthy()
  })

  it('renders', () => {
    expect(renderer.create(<SelectDocumentTypeSectionCard {...mockProps} />).toJSON()).toMatchSnapshot()
  })

  it('should save in state once search input has changed', () => {
    const wrapper = shallow(<SelectDocumentTypeSectionCard {...mockProps} />)

    const searchInput = wrapper.find('[data-test-id="search-checkboxes"]')

    searchInput.simulate('change', null, { value: 'test' })

    expect(wrapper.state('search')).toBe('test')
  })

  it('should render DocumentTypeFilteredSelector instead of DocumentTypeSelector when search exists', () => {
    const wrapper = shallow(<SelectDocumentTypeSectionCard {...mockProps} />)
    wrapper.setState({
      search: 'Test'
    })

    const documentTypeSelector = wrapper.find('DocumentTypeSelector')
    const documentTypeFilteredSelector = wrapper.find('DocumentTypeFilteredSelector')

    expect(documentTypeSelector.length).toBe(0)
    expect(documentTypeFilteredSelector.length).toBe(1)
  })

  it('should clear search once icon is clicked', () => {
    const wrapper = shallow(<SelectDocumentTypeSectionCard {...mockProps} />)
    wrapper.setState({
      search: 'Test'
    })

    const clearIcon = wrapper.find('[data-test-id="clear-search"]')
    clearIcon.simulate('click')

    expect(wrapper.state('search')).toBe('')
  })
})
