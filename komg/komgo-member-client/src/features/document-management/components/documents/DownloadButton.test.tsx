import { shallow, mount } from 'enzyme'
import * as React from 'react'
import * as util from 'util'
import { Button } from 'semantic-ui-react'
import { DownloadButton } from './DownloadButton'
import { fakeDocument } from '../../utils/faker'
import { DocumentType } from '../../store'
import { mockDocumentTypes } from '../../store/document-types/mock-data'
import * as renderer from 'react-test-renderer'

describe('DownloadButton component', () => {
  const mockFunc = jest.fn(() => void 0)
  const mockDocument = fakeDocument()
  const mockDocType: DocumentType = mockDocumentTypes[0]

  it('renders', () => {
    const props = {
      document: mockDocument,
      docType: mockDocType,
      onOriginalDocument: mockFunc,
      onDocumentDownload: mockFunc
    }

    expect(renderer.create(<DownloadButton {...props} />).toJSON()).toMatchSnapshot()
  })
})
