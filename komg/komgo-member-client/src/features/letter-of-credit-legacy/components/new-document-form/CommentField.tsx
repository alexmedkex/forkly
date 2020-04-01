import { ErrorLabel } from '../../../../components/error-message/ErrorLabel'
import { FormikProps } from 'formik'
import * as React from 'react'
import { Form } from 'semantic-ui-react'

interface Props {
  formik: FormikProps<{
    comment: string
  }>
}

export const CommentField: React.SFC<Props> = (props: Props) => {
  return (
    <React.Fragment>
      <Form.Field>
        <label>Comment</label>
        <Form.TextArea
          name="comment"
          placeholder="Comment"
          onChange={props.formik.handleChange}
          onBlur={props.formik.handleBlur}
          value={props.formik.values.comment}
          size="mini"
        />
      </Form.Field>
      {props.formik.errors.comment &&
        props.formik.touched.comment && <ErrorLabel message={props.formik.errors.comment} />}
    </React.Fragment>
  )
}
