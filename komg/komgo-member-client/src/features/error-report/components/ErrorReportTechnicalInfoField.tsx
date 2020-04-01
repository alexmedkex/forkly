import { FormikProps } from 'formik'
import * as React from 'react'
import { Form, TextArea } from 'semantic-ui-react'

interface Props {
  formik: FormikProps<{
    technicalInfo: string
    addTechnicalInfo: boolean
  }>
}

export const ErrorReportTechnicalInfoField: React.SFC<Props> = (props: Props) => (
  <React.Fragment>
    <Form.Field>
      <TextArea
        name="technicalInfo"
        rows="4"
        disabled={!props.formik.values.addTechnicalInfo}
        readOnly={true}
        onChange={props.formik.handleChange}
        onBlur={props.formik.handleBlur}
        value={props.formik.values.technicalInfo}
        size="mini"
      />
    </Form.Field>
  </React.Fragment>
)
