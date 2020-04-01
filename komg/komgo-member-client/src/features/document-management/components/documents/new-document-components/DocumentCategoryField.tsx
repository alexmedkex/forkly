import { FormikErrorLabel } from '../../../../../components/error-message/ErrorLabel'
import { FormikProps } from 'formik'
import * as React from 'react'
import { Dropdown, Form } from 'semantic-ui-react'
import * as Yup from 'yup'

import { Category } from '../../../store/types'
import { hasIdAndNameToOption } from './utils'

interface Props {
  formik: FormikProps<{
    categoryId?: string
  }>
  categories: Category[]
  preselectedCategory: string
}

export const DocumentCategoryField: React.SFC<Props> = (props: Props) => {
  return (
    <React.Fragment>
      <Form.Field>
        <label>Category *</label>
        <Form.Dropdown
          name="categoryId"
          fluid={true}
          button={true}
          placeholder="Select category"
          disabled={props.preselectedCategory !== ''}
          defaultValue={props.preselectedCategory}
          options={hasIdAndNameToOption(props.categories)}
          onChange={(event, value) => {
            props.formik.setFieldValue('categoryId', value.value)
          }}
          onBlur={props.formik.handleBlur}
          error={props.formik.errors.categoryId && props.formik.touched.categoryId}
        />
      </Form.Field>
      {props.formik.errors.categoryId &&
        props.formik.touched.categoryId && <FormikErrorLabel message={props.formik.errors.categoryId} />}
    </React.Fragment>
  )
}

export const categoryIdValidation = {
  categoryId: Yup.string().required('Category is required')
}
