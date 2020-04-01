import * as React from 'react'
import { compose } from 'redux'
import { Divider, Form, Button, Modal } from 'semantic-ui-react'
import { SummaryTable } from '../components/amendment/SummaryStep'
import { RouteComponentProps, withRouter } from 'react-router'
import { ApplicationState } from '../../../store/reducers'
import { ILCAmendment, ILCAmendmentRejection } from '@komgo/types'
import { connect } from 'react-redux'
import {
  getLetterOfCreditAmendment,
  rejectLetterOfCreditAmendmentRequest,
  issueLetterOfCreditAmendmentRequest
} from '../store/amendments/actions'
import { clearError } from '../../../store/common/actions'
import { withLoaders, WithLoaderProps } from '../../../components/with-loaders'
import { LoadingTransition, ErrorMessage } from '../../../components'
import { LetterOfCreditAmendmentActionType } from '../store/amendments/types'
import { FileUpload } from '../../../components/form'
import { loadingSelector } from '../../../store/common/selectors'
import { ServerError } from '../../../store/common/types'
import { findErrors } from '../../../store/common/selectors/errorSelector'
import { Formik, Field } from 'formik'
import { TextAreaController, enumToRadioOptions } from '../components'
import { SimpleRadioController } from '../components/InputControllers/SimpleRadioController'

export interface ReviewLcAmendmentTaskProps extends RouteComponentProps<any>, WithLoaderProps {
  getLetterOfCreditAmendment: (id: string) => null
  rejectLetterOfCreditAmendmentRequest: (id: string, amendmentRejection: ILCAmendmentRejection) => null
  issueLetterOfCreditAmendmentRequest: (id: string, file: File) => null
  clearError: (action: string) => null
  amendment: ILCAmendment
  requesting: boolean
  decisionErrors: ServerError[]
}

interface ReviewLcAmendmentTaskValues {
  reviewDecision?: ReviewDecision
  document: File | null
  comment: string
}

enum ReviewDecision {
  Approve = 'approve',
  Deny = 'deny'
}

const submissionActions = [
  LetterOfCreditAmendmentActionType.ISSUE_AMENDMENT_REQUEST,
  LetterOfCreditAmendmentActionType.REJECT_AMENDMENT_REQUEST
]

export class ReviewLcAmendmentTask extends React.Component<ReviewLcAmendmentTaskProps> {
  componentDidMount() {
    this.props.getLetterOfCreditAmendment(this.props.match.params.amendmentId)
  }

  componentWillUnmount() {
    submissionActions.forEach(action => this.props.clearError(action))
  }

  handleDecision = (values: ReviewLcAmendmentTaskValues) => {
    const {
      rejectLetterOfCreditAmendmentRequest,
      issueLetterOfCreditAmendmentRequest,
      amendment: { staticId }
    } = this.props
    if (values.reviewDecision === ReviewDecision.Deny) {
      rejectLetterOfCreditAmendmentRequest(staticId, { comment: values.comment })
    } else {
      issueLetterOfCreditAmendmentRequest(staticId, values.document)
    }
  }

  render() {
    const {
      isFetching,
      errors,
      decisionErrors,
      amendment: { diffs, lcReference }
    } = this.props

    if (errors.length !== 0) {
      return <ErrorMessage title="Letter of credit amendment" error={errors[0]} />
    }

    return isFetching ? (
      <LoadingTransition title="Loading amendment" />
    ) : (
      <Modal open={true}>
        <Modal.Header>Review amendment request</Modal.Header>
        <Modal.Content>
          <Formik
            initialValues={{ reviewDecision: undefined, comment: '', document: null }}
            onSubmit={this.handleDecision}
            render={({ values, setFieldValue, handleSubmit }) => (
              <Form style={{ paddingTop: '8px' }}>
                {this.props.requesting ? (
                  <LoadingTransition title="Sending amendment decision..." marginTop="0" />
                ) : (
                  <>
                    <div>{lcReference}</div>
                    {decisionErrors.length > 0 && <ErrorMessage title="Submission error" error={decisionErrors[0]} />}
                    <Divider hidden={true} />
                    <SummaryTable diffs={diffs} />
                    <Divider hidden={true} />
                    <Field
                      component={SimpleRadioController}
                      name="reviewDecision"
                      fieldName="Amendment decision"
                      options={enumToRadioOptions(ReviewDecision)}
                      data-test-id="decisionRadio"
                    />
                    {values.reviewDecision === ReviewDecision.Approve && (
                      <FileUpload
                        file={values.document}
                        name="MT700"
                        accept=""
                        label="Upload SWIFT MT707/8"
                        uploadFileText="Upload file"
                        onChange={(_, document) => setFieldValue('document', document)}
                      />
                    )}
                    {values.reviewDecision === ReviewDecision.Deny && (
                      <>
                        <b>Comment</b>
                        <Field
                          component={TextAreaController}
                          placeholder="Comment"
                          name="comment"
                          data-test-id="denyCommentBox"
                        />
                      </>
                    )}
                    <Divider hidden={true} />
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <Button
                        content="Cancel"
                        data-test-id="cancel"
                        type="button"
                        onClick={() => this.props.history.goBack()}
                      />
                      <Button
                        content="Submit"
                        data-test-id="submitDecision"
                        disabled={
                          values.reviewDecision === undefined ||
                          (values.reviewDecision === ReviewDecision.Approve && values.document === null)
                        }
                        type="submit"
                        primary={true}
                        onClick={() => handleSubmit()}
                      />
                    </div>
                  </>
                )}
              </Form>
            )}
          />
        </Modal.Content>
      </Modal>
    )
  }
}

const mapStateToProps = (state: ApplicationState, ownProps: ReviewLcAmendmentTaskProps) => {
  return {
    amendment: state
      .get('lcAmendments')
      .get('byStaticId')
      .toJS()[ownProps.match.params.amendmentId] || { diffs: [] },
    requesting: loadingSelector(state.get('loader').get('requests'), submissionActions, false),
    decisionErrors: findErrors(state.get('errors').get('byAction'), submissionActions)
  }
}

export default compose(
  withLoaders({
    actions: [LetterOfCreditAmendmentActionType.GET_AMENDMENT_REQUEST]
  }),
  withRouter,
  connect(mapStateToProps, {
    getLetterOfCreditAmendment,
    rejectLetterOfCreditAmendmentRequest,
    issueLetterOfCreditAmendmentRequest,
    clearError
  })
)(ReviewLcAmendmentTask)
