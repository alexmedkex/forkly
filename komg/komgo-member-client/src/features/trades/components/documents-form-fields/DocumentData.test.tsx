import * as React from 'react'
import { shallow } from 'enzyme'
import * as renderer from 'react-test-renderer'
import { Modal, Button, Form } from 'semantic-ui-react'
import { Formik } from 'formik'

import DocumentData from './DocumentData'
import { mockDocumentTypes } from '../../../document-management/store/document-types/mock-data'
import { initialDocumentData } from '../../constants'
import { DocumentTypeField } from '../../../document-management/components/documents/new-document-components/DocumentTypeField'
import { FileUploadField } from '../../../document-management/components/documents/new-document-components/FileUploadField'

describe('DocumentData component', () => {
  let defaultProps: any

  beforeEach(() => {
    defaultProps = {
      open: false,
      initialDocumentData,
      documentTypes: mockDocumentTypes,
      preselectedDocumentType: '',
      toggleDocumentModal: jest.fn(),
      attachDocument: jest.fn()
    }
  })

  it('should render DocumentData component sucessfully', () => {
    const wrapper = shallow(<DocumentData {...defaultProps} />)

    expect(wrapper.exists()).toBe(true)
  })

  it('should match snapshot', () => {
    const tree = renderer.create(<DocumentData {...defaultProps} />).toJSON() // TODO: open={true} there is a problem with react, will be changed later

    expect(tree).toMatchSnapshot()
  })

  it('should find cancel button', () => {
    const wrapper = shallow(<DocumentData {...defaultProps} open={true} />)

    const cancelButton = wrapper
      .find(Formik)
      .shallow()
      .find(Modal.Actions)
      .shallow()
      .find(Button)
      .first()
      .shallow()

    expect(cancelButton.text()).toBe('Cancel')
  })

  it('should find Attach document button', () => {
    const wrapper = shallow(<DocumentData {...defaultProps} open={true} />)

    const confirmButton = wrapper
      .find(Formik)
      .shallow()
      .find(Modal.Actions)
      .shallow()
      .find(Button)
      .at(1)
      .shallow()

    expect(confirmButton.text()).toBe('Attach document')
  })

  it('should find a document type field', () => {
    const wrapper = shallow(<DocumentData {...defaultProps} open={true} />)

    const fields = wrapper
      .find(Formik)
      .shallow()
      .find(Modal.Content)
      .shallow()
      .find(Form)
      .shallow()
      .find(DocumentTypeField)

    expect(fields.length).toBe(1)
  })

  it('should find a file upload field', () => {
    const wrapper = shallow(<DocumentData {...defaultProps} open={true} />)

    const fields = wrapper
      .find(Formik)
      .shallow()
      .find(Modal.Content)
      .shallow()
      .find(Form)
      .shallow()
      .find(FileUploadField)

    expect(fields.length).toBe(1)
  })
})
