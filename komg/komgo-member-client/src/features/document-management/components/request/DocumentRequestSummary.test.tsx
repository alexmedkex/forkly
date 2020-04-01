import { shallow } from 'enzyme'
import * as React from 'react'
import DocumentRequestSummary from './DocumentRequestSummary'

import { mockDocumentTypes } from '../../../document-management/store/document-types/mock-data'

describe('DocumentRequestSummary component', () => {
  const mockFunc = jest.fn(() => void 0)
  const mockProps = { selectedModalDocumentTypes: mockDocumentTypes, selectedCounterpartyName: 'anon' }

  it('should render a DocumentRequestSummary item with props', () => {
    const wrapper = shallow(<DocumentRequestSummary {...mockProps} />)
    expect(wrapper.find('DocumentRequestSummary').exists).toBeTruthy()
  })
})
