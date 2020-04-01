import {
  categoryIdValidation,
  DocumentCategoryField
} from '../../document-management/components/documents/new-document-components/DocumentCategoryField'
import {
  DocumentNameField,
  nameValidation
} from '../../document-management/components/documents/new-document-components/DocumentNameField'
import {
  DocumentTypeField,
  typeIdValidation
} from '../../document-management/components/documents/new-document-components/DocumentTypeField'
import {
  FileUploadField,
  fileValidation
} from '../../document-management/components/documents/new-document-components/FileUploadField'
import { Category } from '../../document-management/store/types/category'
import { DocumentType } from '../../document-management/store/types/document-type'
import { Formik, FormikProps } from 'formik'
import * as React from 'react'
import { Form } from 'semantic-ui-react'
import * as Yup from 'yup'

import { CreateLetterOfCreditDocumentRequest } from '../store/types'
import { CommentField } from './new-document-form/CommentField'
import { ParcelIdField } from './new-document-form/ParcelIdField'
import { IParcel } from '@komgo/types'

const TRADE_DOCUMENTS_ID = 'trade-documents'

interface Props {
  context?: any
  categories: Category[]
  documentTypes: DocumentType[]
  parcels: IParcel[]
  handleSubmit(formData: CreateLetterOfCreditDocumentRequest): void
  toggleSubmit?(enable: boolean): void
}

interface NewDocumentForm {
  name: string
  categoryId: string
  typeId: string
  parcelId: string
  file: File | null
  fileName: string
  comment: string
}

const validationSchema = Yup.object().shape({
  ...nameValidation,
  ...categoryIdValidation,
  ...typeIdValidation,
  ...fileValidation
})

class AddNewLetterOfCreditDocumentForm extends React.Component<Props, any> {
  constructor(props: Props) {
    super(props)
  }

  render() {
    return (
      <Formik
        initialValues={{
          name: '',
          categoryId: TRADE_DOCUMENTS_ID,
          typeId: '',
          parcelId: '',
          file: null,
          fileName: '',
          comment: ''
        }}
        validationSchema={validationSchema}
        onSubmit={(values, actions) => {
          this.props.handleSubmit({
            context: this.props.context,
            name: values.name,
            categoryId: values.categoryId,
            documentTypeId: values.typeId,
            parcelId: values.parcelId,
            file: values.file!,
            comment: values.comment
          })
        }}
        render={(props: FormikProps<NewDocumentForm>) => {
          const { values, handleSubmit } = props
          this.props.toggleSubmit(props.isValid) // TODO: this logic should be refactored and moved from render
          return (
            <Form onSubmit={handleSubmit} id="submit-form">
              <DocumentNameField formik={props} />

              <DocumentCategoryField
                formik={props}
                categories={this.props.categories}
                preselectedCategory={TRADE_DOCUMENTS_ID}
              />

              <DocumentTypeField
                formik={props}
                categoryId={values.categoryId}
                documentTypes={this.props.documentTypes}
                preselectedDocumentType=""
              />

              <ParcelIdField formik={props} parcels={this.props.parcels} />

              <FileUploadField onFileNameUpdate={null} formik={props} />

              <CommentField formik={props} />
            </Form>
          )
        }}
      />
    )
  }
}

export default AddNewLetterOfCreditDocumentForm
