import { FormikProps } from 'formik'
import * as React from 'react'
import { Checkbox, Form } from 'semantic-ui-react'

interface Props {
  formik: FormikProps<{
    addTechnicalInfo: boolean
  }>
}

export const ErrorReportAddTechInfoField: React.SFC<Props> = (props: Props) => (
  <React.Fragment>
    <Form.Field>
      <Checkbox
        name="addTechnicalInfo"
        label="Send additional technical information"
        checked={props.formik.values.addTechnicalInfo}
        onChange={(event, value) => props.formik.setFieldValue('addTechnicalInfo', value.checked)}
      />
    </Form.Field>
  </React.Fragment>
)
