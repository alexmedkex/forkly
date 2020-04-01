import * as React from 'react'
import { ActionCreator } from 'react-redux'
import { Header, Form, Segment, Button, Divider, Grid } from 'semantic-ui-react'
import { Field, Formik } from 'formik'
import { IUserSettings, IUserSettingsRequest } from '@komgo/types'
import styled from 'styled-components'
import { CheckboxController } from '../../letter-of-credit-legacy/components'
import LeavingPageConfirmation from '../../../components/leaving-page-confirmation'

const styles = {
  button: {
    marginRight: 0
  }
}

// We must use string interpolation, otherwise webpack will put a result of the expression
const metricsAndEmailEnabledEnvVar = `${process.env.REACT_APP_METRICS_AND_EMAIL_NOTIFICATIONS}`
// enabled by default
// value 'unefined' is set when you run "npm start", value "" is set for a client running with nginx
const metricsAndEmailEnabled =
  metricsAndEmailEnabledEnvVar === 'true' ||
  metricsAndEmailEnabledEnvVar === 'undefined' ||
  metricsAndEmailEnabledEnvVar === ''

export interface IProps {
  settings: IUserSettings
  updateUserSettings: ActionCreator<void>
}

class NotificationsForm extends React.Component<IProps> {
  getInitialValues(): IUserSettingsRequest {
    const { sendInformationNotificationsByEmail, sendTaskNotificationsByEmail } = this.props.settings

    return {
      sendInformationNotificationsByEmail,
      sendTaskNotificationsByEmail: metricsAndEmailEnabled ? sendTaskNotificationsByEmail : false
    }
  }

  handleSubmit = (values: IUserSettingsRequest) => {
    this.props.updateUserSettings(this.props.settings.userId, values)
  }

  render(): JSX.Element {
    return (
      <StyledGrid>
        <Grid.Column width={11}>
          <Header as="h3">Notifications</Header>
          <Divider />
          <Formik initialValues={this.getInitialValues()} onSubmit={this.handleSubmit} enableReinitialize={true}>
            {({ handleSubmit, handleReset, dirty, isSubmitting }) => (
              <Form onSubmit={handleSubmit}>
                <LeavingPageConfirmation
                  when={dirty && !isSubmitting}
                  message="If you leave this page all changes will be lost"
                />
                <StyledFormField>
                  <StyledLabel>
                    <strong>Task Notifications</strong>
                    <StyledP>
                      Receive information when a new task is received and also when a task is assigned to you
                    </StyledP>
                  </StyledLabel>
                  <CheckboxWrapper>
                    <Field component={CheckboxController} fieldName="In-app" disabled={true} checked={true} />
                    <Field
                      name="sendTaskNotificationsByEmail"
                      component={CheckboxController}
                      fieldName="Email"
                      title={metricsAndEmailEnabled ? '' : 'Your administrator has disabled email notifications'}
                      disabled={!metricsAndEmailEnabled}
                    />
                  </CheckboxWrapper>
                </StyledFormField>
                <Divider />
                <StyledSegment basic={true} textAlign="right">
                  <Button type="button" content="Cancel" onClick={handleReset} />
                  <Button content="Save changes" primary={true} type="submit" style={styles.button} disabled={!dirty} />
                </StyledSegment>
              </Form>
            )}
          </Formik>
        </Grid.Column>
      </StyledGrid>
    )
  }
}

export default NotificationsForm

const StyledGrid = styled(Grid)`
  &&& {
    margin-top: 36px;
  }
`
const StyledFormField = styled(Form.Field)`
  &&& {
    display: flex;
    margin-top: 20px;
    align-items: center;
    justify-content: space-between;
  }
`
const StyledLabel = styled.label`
  display: flex;
`
const StyledP = styled.p`
  font-weight: normal;
`
const CheckboxWrapper = styled.div`
  display: flex;
  .inline.field {
    display: flex;
    justify-content: flex-end;
    width: 100px;
  }
`
const StyledSegment = styled(Segment)`
  &&& {
    padding-right: 0;
  }
`
