import { FormikProps } from 'formik'
import * as React from 'react'
import { Form, Input } from 'semantic-ui-react'
import * as Yup from 'yup'
import { ErrorLabel } from '../../../components/error-message/ErrorLabel'

interface Props {
  formik: FormikProps<{
    subject: string
  }>
}

export const ErrorReportSubjectField: React.SFC<Props> = (props: Props) => (
  <React.Fragment>
    <Form.Field>
      <label>Subject*</label>
      <Input
        name="subject"
        onChange={props.formik.handleChange}
        onBlur={props.formik.handleBlur}
        value={props.formik.values.subject}
      />
    </Form.Field>
    {props.formik.errors.subject &&
      props.formik.touched.subject && <ErrorLabel message={props.formik.errors.subject} />}
  </React.Fragment>
)

export const subjectValidation = {
  subject: Yup.string().required('Subject is required')
}
