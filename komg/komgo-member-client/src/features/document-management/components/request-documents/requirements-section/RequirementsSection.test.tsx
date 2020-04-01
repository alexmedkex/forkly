import * as React from 'react'
import { RequirementsSection, Props } from './RequirementsSection'
import * as renderer from 'react-test-renderer'

import { fakeDocument } from '../../../utils/faker'

describe('RequirementsSection component', () => {
  const mockProps: Props = {
    selectedDocumentTypes: new Set(),
    documentTypesById: new Map(),
    documentsByTypeId: new Map(),
    attachedDocumentsByDocumentTypeId: new Map(),
    toggleSelectionDocType: jest.fn(documentTypeId => null),
    removeAttachedDocument: jest.fn((documentType, documentId) => null),
    toggleAutomatchModalVisible: jest.fn(documentType => null),
    toggleSelectionDocumentType: jest.fn(documentTypeId => null),
    toggleAddDocumentModalVisible: jest.fn(documentType => null),
    openViewDocument: jest.fn()
  }

  it('renders', () => {
    expect(renderer.create(<RequirementsSection {...mockProps} />).toJSON()).toMatchSnapshot()
  })
})
