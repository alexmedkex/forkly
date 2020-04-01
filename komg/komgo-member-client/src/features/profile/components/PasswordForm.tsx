import * as React from 'react'
import { Formik, Field } from 'formik'
import * as Yup from 'yup'
import { isEmpty } from 'lodash'
import { Form, Segment, Button, Grid } from 'semantic-ui-react'
import { IChangePasswordRequest } from '@komgo/types'
import { GridTextController } from '../../letter-of-credit-legacy/components'
import styled from 'styled-components'
import { MultiErrorMessage } from '../../../components/error-message'
import { getErrors } from '../../../utils/getErrors'
import { ServerError } from '../../../store/common/types'
import LeavingPageConfirmation from '../../../components/leaving-page-confirmation'

const styles = {
  input: {
    width: '100%'
  },
  button: {
    marginRight: 0
  }
}

const validationSchema = Yup.object().shape({
  currentPassword: Yup.string().required("'Current password' should not be empty"),
  newPassword: Yup.string()
    .required("'New password' should not be empty")
    .min(12, 'Password should have at least 12 characters')
    .matches(/[a-z]/, 'Password must contain at least 1 lowercase characters')
    .matches(/[A-Z]/, 'Password must contain at least 1 uppercase characters')
    .matches(/[0-9]/, 'Password must contain at least 1 numerical digits')
    .matches(/[\W|_]/, 'Password must contain at least 1 special characters'),
  confirmNewPassword: Yup.string()
    .required("'Confirm new password' should not be empty")
    .oneOf([Yup.ref('newPassword'), null], 'Passwords must match')
})

export interface IProps {
  errors: ServerError[]
  resetPassword: (values: IChangePasswordRequest) => void
}

interface ServerErrors {
  [fieldName: string]: string
}

class PasswordForm extends React.Component<IProps> {
  getInitialValues(): IChangePasswordRequest {
    return {
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: ''
    }
  }

  getServerError = (values: IChangePasswordRequest): ServerErrors => {
    return this.props.errors.reduce((obj, error) => {
      if (!error.fields) {
        return obj
      }

      for (const key in error.fields.data as any) {
        if (values[key]) {
          obj[key] = error.fields.data[key].join('')
        }
      }
      return obj
    }, {})
  }

  handleSubmit = (values: IChangePasswordRequest) => {
    this.props.resetPassword(values)
  }

  render(): JSX.Element {
    return (
      <StyledGrid>
        <Grid.Column width={11}>
          <Formik
            initialValues={this.getInitialValues()}
            validationSchema={validationSchema}
            onSubmit={this.handleSubmit}
            enableReinitialize={true}
          >
            {({ handleSubmit, handleReset, errors: formErrors, touched, values, dirty, isSubmitting }) => {
              const serverErrors = this.getServerError(values)
              const errors = { ...formErrors, ...serverErrors }
              const touchedErrors = getErrors(errors, touched)

              return (
                <Form onSubmit={handleSubmit}>
                  <LeavingPageConfirmation
                    when={dirty && !isSubmitting}
                    message="If you leave this page all changes will be lost"
                  />
                  {!isEmpty(touchedErrors) && (
                    <MultiErrorMessage
                      title="Validation Errors"
                      data-test-id="Validation Errors"
                      messages={touchedErrors}
                    />
                  )}
                  <Field
                    type="password"
                    name="currentPassword"
                    fieldName="Current password"
                    component={GridTextController}
                    error={errors.currentPassword && touched.currentPassword}
                    style={styles.input}
                  />
                  <Field
                    type="password"
                    name="newPassword"
                    fieldName="New password"
                    component={GridTextController}
                    error={errors.newPassword && touched.newPassword}
                    style={styles.input}
                  />
                  <Field
                    type="password"
                    name="confirmNewPassword"
                    fieldName="Confirm new password"
                    component={GridTextController}
                    error={errors.confirmNewPassword && touched.confirmNewPassword}
                    style={styles.input}
                  />
                  <StyledSegment basic={true} textAlign="right">
                    <Button type="button" content="Cancel" onClick={handleReset} />
                    <Button
                      type="submit"
                      content="Save changes"
                      primary={true}
                      style={styles.button}
                      disabled={!dirty}
                    />
                  </StyledSegment>
                </Form>
              )
            }}
          </Formik>
        </Grid.Column>
      </StyledGrid>
    )
  }
}

export default PasswordForm

const StyledGrid = styled(Grid)`
  &&& {
    margin-top: 36px;
  }
`
const StyledSegment = styled(Segment)`
  &&& {
    padding-right: 0;
  }
`
