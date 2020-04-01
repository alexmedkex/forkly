import { FormikProps } from 'formik'
import * as React from 'react'
import { Form, Input } from 'semantic-ui-react'
import * as Yup from 'yup'
import { FormikErrorLabel } from '../../../../../components/error-message/ErrorLabel'

interface Props {
  formik: FormikProps<{
    name: string
  }>
}

export const DocumentNameField: React.SFC<Props> = (props: Props) => {
  return (
    <React.Fragment>
      <Form.Field>
        <label>Document title *</label>
        <Form.Input
          name="name"
          placeholder="Document name"
          onChange={props.formik.handleChange}
          onBlur={props.formik.handleBlur}
          value={props.formik.values.name}
          error={props.formik.errors.name && props.formik.touched.name}
        />
      </Form.Field>
      {props.formik.errors.name && props.formik.touched.name && <FormikErrorLabel message={props.formik.errors.name} />}
    </React.Fragment>
  )
}

export const nameValidation = {
  name: Yup.string().required('Document title is required')
}
