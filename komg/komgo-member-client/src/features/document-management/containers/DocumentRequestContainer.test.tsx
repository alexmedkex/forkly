import { shallow } from 'enzyme'
import * as React from 'react'
import { DocumentRequestContainer, Props } from './DocumentRequestContainer'
import { mockProduct } from '../store/products/mock-data'
import { mockDocumentTypes } from '../store/document-types/mock-data'
import { Request } from '../store'
import { RouteComponentProps } from 'react-router'
import { fakeRouteComponentProps } from '../../receivable-discounting-legacy/utils/faker'
import { WithLoaderProps } from '../../../components/with-loaders'

describe('DocumentRequestContainer component', () => {
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
  const mockProps: Props & RouteComponentProps<any> & WithLoaderProps = {
    isFetching: false,
    errors: [],
    allDocs: [],
    history: {},
    location: {},
    requestById: mockRequest,
    counterparties: [],
    fetchIncomingRequestbyIdAsync: jest.fn(),
    fetchConnectedCounterpartiesAsync: jest.fn(),
    fetchCategoriesAsync: jest.fn(),
    sendDocumentsAsync: jest.fn(),
    fetchDocumentsAsync: jest.fn(),
    downloadDocumentsAsync: jest.fn(),
    createDocumentAsync: jest.fn(),
    resetLoadedDocument: jest.fn(),
    ...fakeRouteComponentProps()
  }

  it('should render a child div with DocumentRequestContainer item with props', () => {
    const wrapper = shallow(<DocumentRequestContainer {...mockProps} />)
    expect(wrapper.find('DocumentManagementContainer').exists).toBeTruthy()
  })
})
