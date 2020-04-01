import { shallow } from 'enzyme'
import * as React from 'react'

import { mockData } from '../../store/templates/mock-data'
import { Category, DocumentType, Request } from '../../store'
import { mockProduct } from '../../store/products/mock-data'
import * as renderer from 'react-test-renderer'
import { ReviewDocumentsSectionCard, Props } from './ReviewDocumentsSectionCard'
import { mockDocumentTypes } from '../../store/document-types/mock-data'

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

  const mockFunc = jest.fn(() => void 0)

  const mockProps: Props = {
    documentRequest: mockRequest,
    onOriginalDocument: mockFunc,
    onDocumentAttachmentDownload: jest.fn(),
    documentsByType: new Map(),
    attachedDocuments: new Map(),
    automatchSelectRequested: jest.fn(),
    addNewDocumentRequested: jest.fn(),
    deleteDocRequested: jest.fn(),
    resetLoadedDocument: jest.fn(),
    downloadedRequestAttachmentForTypes: [],
    openViewDocument: jest.fn()
  }

  it('should render an empty DocumentTypeSelector item with props', () => {
    const wrapper = shallow(<ReviewDocumentsSectionCard {...mockProps} />)
    expect(wrapper.find('StyledTab').exists).toBeTruthy()
    expect(wrapper.find('StyledListDocTypes').exists).toBeTruthy()
    expect(wrapper.find('TileWithItems').exists).toBeTruthy()
  })

  it('renders', () => {
    expect(renderer.create(<ReviewDocumentsSectionCard {...mockProps} />).toJSON()).toMatchSnapshot()
  })
})
