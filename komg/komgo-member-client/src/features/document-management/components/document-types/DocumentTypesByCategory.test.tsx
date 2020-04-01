import { shallow } from 'enzyme'
import * as React from 'react'

import { groupBy } from '../../../document-management/components/documents/my-documents/toMap'
import { mockCategories } from '../../store/categories/mock-data'
import { mockDocumentTypes } from '../../store/document-types/mock-data'

import DocumentTypesByCategory, { Props } from './DocumentTypesByCategory'

describe('DocumentTypesByCategory component', () => {
  const mockProps: Props = {
    documentTypes: mockDocumentTypes,
    categories: mockCategories,
    selectedDocumentTypesByCategory: groupBy(mockDocumentTypes, dt => dt.category.id),
    panelCheckboxState: mockDocumentTypes.reduce((acc, dt) => acc.set(dt.id, -1), new Map()),
    markAsDisabled: jest.fn((documentName: string) => ({ isDisabled: false, disableText: '' } as any)),
    isSelected: jest.fn(),
    onPanelClick: jest.fn(),
    onListItemClick: jest.fn()
  }

  it('should render a DocumentTypesByCategory', () => {
    const wrapper = shallow(<DocumentTypesByCategory {...mockProps} />)
    expect(wrapper.find('DocumentTypesByCategory').exists).toBeTruthy()
  })
})
