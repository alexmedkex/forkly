import { Profile } from '../../../../store/common/types'
import { Document } from '../../../../features/document-management/store'
import { ApplicationState } from '../../../../store/reducers'
import { Formik, FormikProps } from 'formik'
import * as React from 'react'
import { connect } from 'react-redux'
import { Form } from 'semantic-ui-react'
import * as Yup from 'yup'
import * as path from 'path'

import { Category, CreateDocumentRequest, DocumentType } from '../../store/types'
import { categoryIdValidation, DocumentCategoryField } from './new-document-components/DocumentCategoryField'
import { DocumentNameField, nameValidation } from './new-document-components/DocumentNameField'
import { DocumentTypeField, typeIdValidation } from './new-document-components/DocumentTypeField'
import { FileUploadField, fileValidation } from './new-document-components/FileUploadField'
import { sortCategories, sortDocumentTypes } from '../../utils/sortingHelper'

export interface Props {
  documents: Document[]
  categories?: Category[]
  documentTypes: DocumentType[]
  profile: Profile
  preselectedCategory: string
  preselectedDocumentType: string
  documentTypeDisabled?: boolean
  handleSubmit(formData: CreateDocumentRequest): void
  toggleSubmit?(enable: boolean): void
}

interface State {
  fileName: string
}

interface NewDocumentForm {
  name: string
  categoryId?: string
  typeId: string
  file: File | null
  fileName: string
}

export class AddNewDocumentForm extends React.Component<Props, State> {
  private validationSchema

  constructor(props: Props) {
    super(props)

    this.validationSchema = this.formValidationSchema()

    this.onFileNameUpdate = this.onFileNameUpdate.bind(this)
  }

  render() {
    return (
      <Formik
        initialValues={{
          name: '',
          categoryId: this.props.preselectedCategory || undefined,
          typeId:
            this.getPreselectedDocumentType(
              this.props.preselectedDocumentType,
              this.props.documentTypes,
              this.props.preselectedCategory
            ) || '',
          file: null,
          fileName: ''
        }}
        validationSchema={this.validationSchema}
        onSubmit={(values, actions) => {
          this.props.handleSubmit({
            name: values.name,
            categoryId: values.categoryId,
            documentTypeId: values.typeId,
            file: values.file!,
            creator: {
              firstName: this.props.profile.firstName,
              lastName: this.props.profile.lastName,
              companyId: this.props.profile.company
            }
          })
        }}
        render={(props: FormikProps<NewDocumentForm>) => {
          const { values, handleSubmit } = props

          const categoryId = this.props.categories ? values.categoryId : undefined
          this.props.toggleSubmit(props.isValid) // TODO: this logic should be refactored and moved from render

          return (
            <Form onSubmit={handleSubmit} id="submit-form" className="add-new-document">
              <DocumentNameField formik={props} />

              {this.props.categories && (
                <DocumentCategoryField
                  formik={props}
                  categories={sortCategories(this.props.categories)}
                  preselectedCategory={this.props.preselectedCategory}
                />
              )}

              <DocumentTypeField
                formik={props}
                categoryId={categoryId}
                documentTypes={sortDocumentTypes(this.props.documentTypes)}
                preselectedDocumentType={this.getPreselectedDocumentType(
                  this.props.preselectedDocumentType,
                  this.props.documentTypes,
                  values.categoryId
                )}
                disabled={this.props.documentTypeDisabled}
              />

              <FileUploadField formik={props} onFileNameUpdate={this.onFileNameUpdate} />
            </Form>
          )
        }}
      />
    )
  }

  /**
   * A document type is preselected if:
   * - It is passed explicitly as a prop or if it is.
   * - It is the only document type available for that category, in this case it is also preselected and disabled.
   */
  getPreselectedDocumentType(
    preselectedDocumentType: string,
    documentTypes: DocumentType[],
    categoryId: string
  ): string {
    const filteredDocumentTypes: DocumentType[] = documentTypes.filter(x => x.category.id === categoryId)
    if (preselectedDocumentType) {
      return preselectedDocumentType
    } else if (filteredDocumentTypes.length === 1) {
      return filteredDocumentTypes[0].id
    } else {
      return ''
    }
  }

  // To get document extension to build full name
  onFileNameUpdate(fileName: string) {
    this.setState({
      fileName
    })
  }

  private formValidationSchema(): any {
    const fields = {
      name: this.validateDocumentName(),
      ...typeIdValidation,
      ...fileValidation
    }

    return this.props.categories
      ? Yup.object().shape({
          ...fields,
          ...categoryIdValidation
        })
      : Yup.object().shape(fields)
  }

  private validateDocumentName() {
    return Yup.string()
      .required('Document title is required')
      .test(
        'unique-name',
        'A document with the same name already exists. Choose another name.',
        this.noDocumentWithTheSameName.bind(this)
      )
  }

  private noDocumentWithTheSameName(name: string): boolean {
    if (!this.state || !this.state.fileName) {
      return true
    }

    const docNameWithExt = `${name}${path.extname(this.state.fileName)}`
    const foundDocument = this.props.documents.find(doc => doc.name === docNameWithExt)
    return !foundDocument
  }
}

const mapStateToProps = (state: ApplicationState) => ({
  profile: state.get('uiState').get('profile')
})

export default connect(mapStateToProps, {})(AddNewDocumentForm)
