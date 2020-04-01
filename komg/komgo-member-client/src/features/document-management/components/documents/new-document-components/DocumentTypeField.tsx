import { FormikErrorLabel } from '../../../../../components/error-message/ErrorLabel'
import { FormikProps } from 'formik'
import * as React from 'react'
import { Form } from 'semantic-ui-react'
import * as Yup from 'yup'

import { DocumentType } from '../../../store/types'
import { hasIdAndNameToOption } from './utils'

export interface IProps {
  formik: FormikProps<{
    typeId: string
  }>
  categoryId?: string
  documentTypes: DocumentType[]
  preselectedDocumentType: string
  disabled?: boolean
}

const TYPEID_FIELD = 'typeId'

/**
 * This function checks if the selected document type is included in the selected
 * category. Can happen that we selected a document type from a previous category and
 * when we switch to the new category we have to clear the document type selection.
 * This function tells us if thats the case.
 */
function selectedDocTypeOwnsThisCategory(props: IProps): boolean {
  const docType: DocumentType = props.documentTypes.find(x => x.id === props.formik.values.typeId)
  return docType && docType.category.id === props.categoryId
}

export const DocumentTypeField: React.SFC<IProps> = (props: IProps) => {
  const { typeId } = props.formik.values
  const currentTypeId = typeId ? typeId : props.preselectedDocumentType
  if (currentTypeId && props.formik.values.typeId !== currentTypeId) {
    props.formik.setFieldValue(TYPEID_FIELD, currentTypeId)
  } else if (currentTypeId !== '' && !selectedDocTypeOwnsThisCategory(props) && props.categoryId) {
    props.formik.setFieldValue(TYPEID_FIELD, '')
  }
  return (
    <React.Fragment>
      <Form.Field>
        <label>Document type *</label>
        <Form.Dropdown
          name={TYPEID_FIELD}
          disabled={isDisabled(props)}
          fluid={true}
          button={true}
          placeholder="Select type"
          options={hasIdAndNameToOption(typesToDisplay(props.categoryId, props))}
          onChange={(event, value) => {
            props.formik.setFieldValue(TYPEID_FIELD, value.value)
          }}
          onBlur={props.formik.handleBlur}
          value={currentTypeId}
          error={props.formik.errors.typeId && props.formik.touched.typeId}
        />
      </Form.Field>
      {props.formik.errors.typeId &&
        props.formik.touched.typeId && <FormikErrorLabel message={props.formik.errors.typeId} />}
    </React.Fragment>
  )
}

function typesToDisplay(selectedCategoryId: string, props: IProps) {
  return props.documentTypes.filter(docType => {
    return selectedCategoryId ? docType.category.id === selectedCategoryId : docType
  })
}

/**
 * This field is disabled if the disabled props is defined and true. If not, it is disabled if
 * the categoryId is not defined or if the preselectedDocumentType is not empty
 */
function isDisabled(props: IProps) {
  const { disabled } = props
  return disabled !== undefined ? disabled : !props.categoryId || props.preselectedDocumentType !== ''
}

export const typeIdValidation = {
  typeId: Yup.string().required('Document type is required')
}
