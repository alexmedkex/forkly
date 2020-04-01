import { shallow } from 'enzyme'
import * as React from 'react'
import { IncomingRequestContainer, Props } from './IncomingRequestContainer'
import { mockProduct } from '../store/products/mock-data'
import { mockDocumentTypes } from '../store/document-types/mock-data'
import { mockDocuments } from '../store/documents/mock-data'
import { Document, DocumentType, Request } from '../store'
import { Counterparty } from '../../counterparties/store/types'
import { WithPermissionsProps } from '../../../components/with-permissions'

describe('IncomingRequestContainer component', () => {
  const MOCK_REQUEST_ID = '-999'
  const mockRequest: Request = {
    companyId: '-1',
    product: mockProduct,
    types: mockDocumentTypes,
    name: 'anon',
    id: MOCK_REQUEST_ID,
    sentDocuments: [],
    documents: [],
    notes: []
  }
  const mockProps: Props & WithPermissionsProps = {
    isAuthorized: () => true,
    error: null,
    errors: [],
    isFetching: true,
    location: { state: { requestId: MOCK_REQUEST_ID } },
    allDocs: [],
    selectedDocuments: [],
    history: null,
    requests: [mockRequest],
    counterparties: [],
    documentTypes: mockDocumentTypes,
    allVisibleDocuments: mockDocuments,
    documentsGroupByType: new Map(),
    fetchIncomingRequestAsync: jest.fn(),
    fetchDocumentTypesAsync: jest.fn(),
    fetchDocumentsAsync: jest.fn(),
    createDocumentAsync: jest.fn(),
    sendDocumentsAsync: jest.fn(),
    fetchingConnectedCounterparties: false,
    fetchConnectedCounterpartiesAsync: jest.fn(),
    selectDocument: jest.fn(),
    selectDocumentType: jest.fn(),
    resetDocumentsSelectData: jest.fn()
  }

  it('should render a child div with IncomingRequestContainer item with props', () => {
    const wrapper = shallow(<IncomingRequestContainer {...mockProps} />)
    expect(wrapper.find('IncomingRequestContainerclear').exists).toBeTruthy()
  })
})
