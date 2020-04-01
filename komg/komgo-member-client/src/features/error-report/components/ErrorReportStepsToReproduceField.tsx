import { FormikProps } from 'formik'
import * as React from 'react'
import { Form, TextArea } from 'semantic-ui-react'
import * as Yup from 'yup'
import { ErrorLabel } from '../../../components/error-message/ErrorLabel'
import styled from 'styled-components'

interface Props {
  formik: FormikProps<{
    stepsToReproduce: string
  }>
}

const FieldDescription = styled.span`
  font-size: 12px;
`

export const ErrorReportStepsToReproduceField: React.SFC<Props> = (props: Props) => (
  <React.Fragment>
    <Form.Field>
      <label>Steps to reproduce*</label>
      <TextArea
        name="stepsToReproduce"
        rows="4"
        onChange={props.formik.handleChange}
        onBlur={props.formik.handleBlur}
        value={props.formik.values.stepsToReproduce}
        size="mini"
      />
      <FieldDescription>
        Please enter the details of your request. A member of our support staff will respond as soon as possible
      </FieldDescription>
    </Form.Field>
    {props.formik.errors.stepsToReproduce &&
      props.formik.touched.stepsToReproduce && <ErrorLabel message={props.formik.errors.stepsToReproduce} />}
  </React.Fragment>
)

export const stepsToReproduceValidation = {
  stepsToReproduce: Yup.string().required('Steps to reproduce is required')
}
