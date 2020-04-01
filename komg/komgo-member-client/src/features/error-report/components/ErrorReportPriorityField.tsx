import { FormikProps } from 'formik'
import * as React from 'react'
import { Dropdown, Form } from 'semantic-ui-react'

import { ErrorReportSeverity } from '../store/types'

interface Props {
  formik: FormikProps<{
    severity: number
  }>
}

export const ErrorReportPriorityField: React.SFC<Props> = (props: Props) => {
  return (
    <React.Fragment>
      <Form.Field>
        <label>Severity</label>
        <Dropdown
          id="severity"
          name="severity"
          fluid={true}
          selection={true}
          options={typesToDisplay(ErrorReportSeverity)}
          onChange={(event, value) => props.formik.setFieldValue('severity', value.value)}
          onBlur={props.formik.handleBlur}
          value={props.formik.values.severity}
        />
      </Form.Field>
    </React.Fragment>
  )
}

function typesToDisplay(severities) {
  const mappedPriorities = []
  for (const severity in severities) {
    if (typeof severities[severity] === 'number') {
      mappedPriorities.push({ id: severities[severity], value: severities[severity], text: severity })
    }
  }
  return mappedPriorities
}
