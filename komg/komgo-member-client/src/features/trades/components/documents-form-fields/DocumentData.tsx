import * as React from 'react'
import { Formik, FormikProps } from 'formik'
import * as Yup from 'yup'

import { ITradeDocument } from '../../store/types'
import {
  DocumentTypeField,
  typeIdValidation
} from '../../../document-management/components/documents/new-document-components/DocumentTypeField'
import {
  FileUploadField,
  fileValidation
} from '../../../document-management/components/documents/new-document-components/FileUploadField'
import { Form, Modal, Button } from 'semantic-ui-react'
import { DocumentType } from '../../../document-management'
import {
  DocumentNameField,
  nameValidation
} from '../../../document-management/components/documents/new-document-components/DocumentNameField'

interface IProps {
  open: boolean
  initialDocumentData: ITradeDocument
  documentTypes: DocumentType[]
  preselectedDocumentType: string
  toggleDocumentModal: () => void
  attachDocument: (document: ITradeDocument) => void
}

const validationSchema = Yup.object().shape({
  ...nameValidation,
  ...typeIdValidation,
  ...fileValidation
})

class DocumentData extends React.Component<IProps> {
  handleSubmit = (values: ITradeDocument) => {
    this.props.attachDocument(values)
    this.props.toggleDocumentModal()
  }

  closeModal = (formik: FormikProps<ITradeDocument>) => {
    formik.resetForm()
    this.props.toggleDocumentModal()
  }

  render() {
    const { open, initialDocumentData } = this.props
    return (
      <Modal open={open} size="large">
        <Formik
          initialValues={initialDocumentData}
          onSubmit={this.handleSubmit}
          validationSchema={validationSchema}
          render={(formik: FormikProps<ITradeDocument>) => (
            <React.Fragment>
              <Modal.Header>Attach document</Modal.Header>
              <Modal.Content>
                <Form className="add-new-document">
                  <DocumentNameField formik={formik} />

                  <DocumentTypeField
                    formik={formik}
                    documentTypes={this.props.documentTypes}
                    preselectedDocumentType={this.props.preselectedDocumentType}
                    disabled={false}
                  />

                  <FileUploadField onFileNameUpdate={null} formik={formik} />
                </Form>
              </Modal.Content>
              <Modal.Actions>
                <Button type="button" onClick={() => this.closeModal(formik)} content="Cancel" />
                <Button type="submit" primary={true} onClick={() => formik.handleSubmit()} content="Attach document" />
              </Modal.Actions>
            </React.Fragment>
          )}
        />
      </Modal>
    )
  }
}

export default DocumentData
