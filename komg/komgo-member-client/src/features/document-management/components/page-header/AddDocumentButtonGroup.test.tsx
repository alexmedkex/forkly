import { shallow } from 'enzyme'
import * as React from 'react'
import { Dropdown, DropdownItem } from 'semantic-ui-react'

import { AddDocumentButtonGroup } from './AddDocumentButtonGroup'

describe('DocumentRequestDropdown component', () => {
  const mockFunc = jest.fn(() => void 0)

  const mockProps = {
    userCanCrudAndShareDocs: true,
    onNewDocumentTypeClick: mockFunc,
    onNewDocumentClick: mockFunc
  }

  it('should render a AddDocumentButtonGroup item with props', () => {
    const wrapper = shallow(<AddDocumentButtonGroup {...mockProps} />)

    expect(wrapper.find('AddDocumentButtonGroup').exists).toBeTruthy()
  })

  it('should render a dropdown', () => {
    const wrapper = shallow(<AddDocumentButtonGroup {...mockProps} />)

    expect(wrapper.find(Dropdown)).toBeTruthy()
  })

  /*
    Skipped until 'Add Document Type' feature is enabled.
  */
  xit('with two items', () => {
    const wrapper = shallow(<AddDocumentButtonGroup {...mockProps} />)
    const actual = wrapper.find(Dropdown.Item)

    expect(actual).toHaveLength(2)
  })

  /*
    Skipped until 'Add Document Type' feature is enabled.
  */
  xit('the first dropdown item should have value "New Document Type"', () => {
    const wrapper = shallow(<AddDocumentButtonGroup {...mockProps} />)
    const expected = 'New Document Type'
    const actual = wrapper.find(Dropdown.Item).first()

    expect(actual.props()).toHaveProperty('value', expected)
  })

  /*
    Skipped until 'Add Document Type' feature is enabled.
  */
  xit('the first dropdown item should be disabled', () => {
    const wrapper = shallow(<AddDocumentButtonGroup {...mockProps} />)
    const actual = wrapper.find(Dropdown.Item).first()

    expect(actual.props()).toHaveProperty('disabled', true)
  })

  it('the second dropdown item should have value "New Document"', () => {
    const wrapper = shallow(<AddDocumentButtonGroup {...mockProps} />)
    const expected = 'New Document'
    const actual = wrapper.find(Dropdown.Item).at(0)

    expect(actual.props()).toHaveProperty('value', expected)
  })

  it('clicking the second dropdown item should fire "onNewDocumentClick"', () => {
    const wrapper = shallow(<AddDocumentButtonGroup {...mockProps} />)
    const sut = wrapper.find(Dropdown.Item).at(0)

    sut.simulate('click')
    expect(mockProps.onNewDocumentClick).toHaveBeenCalledTimes(1)
  })
})
