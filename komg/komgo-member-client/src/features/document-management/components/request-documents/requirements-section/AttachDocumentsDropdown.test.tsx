import * as React from 'react'
import { AttachDocumentsDropdown, Props } from './AttachDocumentsDropdown'
import * as renderer from 'react-test-renderer'

import { fakeDocument } from '../../../utils/faker'

describe('AttachDocumentsDropdown component', () => {
  const mockProps: Props = {
    documentType: fakeDocument().type,
    automatchCount: 0,
    attachedDocument: null,
    toggleAutomatchModalVisible: jest.fn(documentType => null),
    toggleAddDocumentModalVisible: jest.fn(documentType => null)
  }

  it('renders', () => {
    expect(renderer.create(<AttachDocumentsDropdown {...mockProps} />)).toMatchSnapshot()
  })
})
