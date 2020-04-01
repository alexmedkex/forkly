import * as React from 'react'
import { compose } from 'redux'
import { connect } from 'react-redux'
import styled from 'styled-components'
import * as Yup from 'yup'
import { withRouter, RouteComponentProps } from 'react-router-dom'
import { Button, Form, Grid, Header } from 'semantic-ui-react'
import { Formik, FormikProps } from 'formik'

import * as ErrorReportActions from '../store/error-report/actions'
import { ErrorReportFormicInterface, ErrorReportSeverity } from '../store/types'

import { ErrorUploadFileField } from '../components/ErrorUploadFileField'
import { ErrorReportSubjectField, subjectValidation } from '../components/ErrorReportSubjectField'
import { ErrorReportDescriptionField, descriptionValidation } from '../components/ErrorReportDescriptionField'
import {
  ErrorReportStepsToReproduceField,
  stepsToReproduceValidation
} from '../components/ErrorReportStepsToReproduceField'
import { ErrorReportTechnicalInfoField } from '../components/ErrorReportTechnicalInfoField'
import { ErrorReportAddTechInfoField } from '../components/ErrorReportAddTechInfoField'
import { ErrorReportPriorityField } from '../components/ErrorReportPriorityField'
import ErrorReportFeedbackModal from '../components/ErrorReportFeedbackModal'
import { ZendeskStorage } from '../../../utils/zendesk-storage'

const StyledGrid = styled(Grid)`
  max-width: 800px;
`

const Wrapper = styled.div`
  display: flex;
  justify-content: center;
  padding: 30px 100px;
`

interface Props extends RouteComponentProps<any> {
  location: any
  createTicket(token: string, report): void
}

interface State {
  token: string | undefined
  formikBag?: FormikProps<ErrorReportFormicInterface>
}

interface UrlParams {
  [key: string]: string | undefined
}

const validationSchema = Yup.object().shape({
  ...subjectValidation,
  ...descriptionValidation,
  ...stepsToReproduceValidation
})

export class ErrorReportForm extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    const hashFragments: string[] = props.location.hash.substr(1).split('&')
    const params: UrlParams = hashFragments.reduce((res, fragment) => {
      const keyValue: string[] = fragment.split('=')
      return { ...res, [keyValue[0]]: keyValue[1] }
    }, {})

    this.state = {
      token: params.access_token,
      formikBag: undefined
    }
  }

  render() {
    const { createTicket } = this.props
    const { token } = this.state

    const userDetails = `User Id: ${ZendeskStorage.user.userId}
User Roles: ${(ZendeskStorage.user.userRoles || []).join(',')}
Company Id: ${ZendeskStorage.user.companyId}`

    const technicalError = `Technical Error
    ${ZendeskStorage.error &&
      Object.entries(ZendeskStorage.error).reduce(
        (res, entry) => `${res}
  ${entry[0]}: ${entry[1]}`,
        ``
      )}`

    const technicalRequests = `Technical requests
    ${ZendeskStorage.requests.reduce((resRequests, request, idx) => {
      const techReq = Object.entries(request).reduce(
        (res, entry) => `${res}
        ${entry[0]}: ${entry[1]}`,
        `${idx}:`
      )

      return `${resRequests}
      ${techReq}`
    }, ``)}`
    return (
      <React.Fragment>
        <Formik
          initialValues={{
            subject: '',
            description: '',
            stepsToReproduce: '',
            addTechnicalInfo: true,
            technicalInfo: `${userDetails}

${technicalError}

${technicalRequests}`,
            uploads: {},
            severity: ErrorReportSeverity['3 - Medium']
          }}
          validationSchema={validationSchema}
          onSubmit={values =>
            createTicket(token, {
              subject: values.subject,
              comment: {
                body: values.description,
                uploads: values.uploads
              },
              custom_fields: [
                {
                  id: process.env.REACT_APP_ZENDESK_STEPS_FIELD_ID,
                  value: `${values.stepsToReproduce} ${
                    values.addTechnicalInfo
                      ? `

######### Technical information ########
${values.technicalInfo}`
                      : ''
                  }`
                },
                {
                  id: process.env.REACT_APP_ZENDESK_SEVERITY_FIELD_ID,
                  value: values.severity
                }
              ]
            })
          }
          render={(formikProps: FormikProps<ErrorReportFormicInterface>) => (
            <Form onSubmit={formikProps.handleSubmit} id="submit-form">
              <Wrapper>
                <StyledGrid>
                  <Grid.Row>
                    <Grid.Column width={8}>
                      <Header as="h1">Report system error</Header>
                    </Grid.Column>
                  </Grid.Row>
                  <Grid.Row>
                    <Grid.Column>
                      <ErrorReportSubjectField formik={formikProps} />
                    </Grid.Column>
                  </Grid.Row>
                  <Grid.Row>
                    <Grid.Column>
                      <ErrorReportDescriptionField formik={formikProps} />
                    </Grid.Column>
                  </Grid.Row>
                  <Grid.Row>
                    <Grid.Column>
                      <ErrorReportStepsToReproduceField formik={formikProps} />
                    </Grid.Column>
                  </Grid.Row>
                  <Grid.Row>
                    <Grid.Column>
                      <ErrorReportPriorityField formik={formikProps} />
                    </Grid.Column>
                  </Grid.Row>
                  <Grid.Row>
                    <Grid.Column>
                      <ErrorUploadFileField formik={formikProps} />
                    </Grid.Column>
                  </Grid.Row>
                  <Grid.Row>
                    <Grid.Column>
                      <ErrorReportAddTechInfoField formik={formikProps} />
                    </Grid.Column>
                  </Grid.Row>
                  <Grid.Row>
                    <Grid.Column>
                      <ErrorReportTechnicalInfoField formik={formikProps} />
                    </Grid.Column>
                  </Grid.Row>
                  <Grid.Row textAlign="right">
                    <Grid.Column>
                      <Button primary={true} type="submit" content="Report error" form="submit-form" />
                    </Grid.Column>
                  </Grid.Row>
                </StyledGrid>
              </Wrapper>
            </Form>
          )}
        />
        <ErrorReportFeedbackModal />
      </React.Fragment>
    )
  }
}

const mapDispatchToProps = {
  createTicket: ErrorReportActions.createTicket
}

export default compose(withRouter, connect(null, mapDispatchToProps))(ErrorReportForm)
