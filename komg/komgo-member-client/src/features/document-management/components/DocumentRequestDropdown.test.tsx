import { shallow } from 'enzyme'
import * as React from 'react'
import DocumentRequestDropdown from './DocumentRequestDropdown'

describe('DocumentRequestDropdown component', () => {
  const mockFunc = jest.fn(() => void 0)

  const mockProps = {
    toggleNewDocumentRequestModal: mockFunc,
    toggleLoadTemplateModal: mockFunc
  }

  it('should render a DocumentRequestDropdown item with props', () => {
    const wrapper = shallow(<DocumentRequestDropdown {...mockProps} />)
    expect(wrapper.find('DocumentRequestDropdown').exists).toBeTruthy()
  })
})
