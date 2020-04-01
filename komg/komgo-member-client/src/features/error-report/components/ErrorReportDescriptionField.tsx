import { FormikProps } from 'formik'
import * as React from 'react'
import { Form, TextArea } from 'semantic-ui-react'
import * as Yup from 'yup'
import { ErrorLabel } from '../../../components/error-message/ErrorLabel'
import styled from 'styled-components'

interface Props {
  formik: FormikProps<{
    description: string
  }>
}

const FieldDescription = styled.span`
  font-size: 12px;
`

export const ErrorReportDescriptionField: React.SFC<Props> = (props: Props) => (
  <React.Fragment>
    <Form.Field>
      <label>Description*</label>
      <TextArea
        name="description"
        rows="4"
        onChange={props.formik.handleChange}
        onBlur={props.formik.handleBlur}
        value={props.formik.values.description}
        size="mini"
      />
      <FieldDescription>
        Please enter the details of your request. A member of our support staff will respond as soon as possible
      </FieldDescription>
    </Form.Field>
    {props.formik.errors.description &&
      props.formik.touched.description && <ErrorLabel message={props.formik.errors.description} />}
  </React.Fragment>
)

export const descriptionValidation = {
  description: Yup.string().required('Description is required')
}
