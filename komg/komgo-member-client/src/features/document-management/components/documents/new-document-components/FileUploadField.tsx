import { FormikErrorLabel } from '../../../../../components/error-message/ErrorLabel'
import { FileUpload } from '../../../../../components/form'
import { PERMITTED_MIME_TYPES } from '../../../../../features/document-management/utils/permittedMimeTypes'
import { FormikProps } from 'formik'
import * as React from 'react'
import { Form } from 'semantic-ui-react'
import * as Yup from 'yup'

interface Props {
  formik: FormikProps<{
    file: File | null
    fileName: string
    fileType?: string
  }>
  onFileNameUpdate: (fileName: string) => void
}

export const FileUploadField: React.SFC<Props> = (props: Props) => {
  return (
    <React.Fragment>
      <Form.Field>
        <FileUpload
          file={props.formik.values.file}
          name={props.formik.values.fileName}
          accept={Object.values(PERMITTED_MIME_TYPES).join(',')}
          label={'File attachment *'}
          uploadFileText={'Upload a file'}
          onChange={(fileName, file) => {
            onFileNameUpdate(props, fileName, file)

            const { type, name } = file || { type: '', name: '' }
            props.formik.setFieldValue('fileType', type)
            props.formik.setFieldValue('fileName', name)
            props.formik.setFieldValue('file', file)
          }}
        />
      </Form.Field>
      {props.formik.errors.fileName &&
        props.formik.touched.fileName && <FormikErrorLabel message={props.formik.errors.fileName} />}
      {props.formik.errors.fileType &&
        props.formik.touched.fileType && <FormikErrorLabel message={props.formik.errors.fileType} />}
    </React.Fragment>
  )
}

export const fileValidation = {
  fileName: Yup.string() // Validating a string is easier
    .required('File is required'),
  fileType: Yup.string()
    .oneOf(Object.values(PERMITTED_MIME_TYPES))
    .required('File type not permitted')
}
function onFileNameUpdate(props: Props, fileName: string, file: File) {
  if (props.onFileNameUpdate) {
    if (file) {
      props.onFileNameUpdate(file.name)
    } else {
      props.onFileNameUpdate(fileName)
    }
  }
}
