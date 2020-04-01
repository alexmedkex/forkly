import * as React from 'react'
import { Button, Form, Modal } from 'semantic-ui-react'
import { Field, FieldProps, Formik, FormikProps, FormikActions } from 'formik'
import { ErrorMessage } from '../../../../components/error-message'
import { RejectLCForm, ACTION_NAME, ACTION_STATUS } from '../../constants'
import { ActionType, LetterOfCreditParticipantNames } from '../../store/types'
import { ILetterOfCredit } from '../../types/ILetterOfCredit'
import { LoadingTransition } from '../../../../components'

interface IProps {
  letter: ILetterOfCredit
  show: boolean
  actions: ActionType
  participantsNames: LetterOfCreditParticipantNames
  handleSubmit: (rejectForm: RejectLCForm) => void
  cancel: () => void
}

interface IState {
  formikBag?: FormikActions<RejectLCForm>
}

class RejectModalLC extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props)
    this.state = {
      formikBag: undefined
    }
  }

  componentDidUpdate(oldProps: IProps) {
    const { actions } = this.props
    if (
      actions.name === ACTION_NAME.REJECT_LC &&
      actions.status !== oldProps.actions.status &&
      actions.status === ACTION_STATUS.FINISHED
    ) {
      this.restartForm(this.state.formikBag!)
    }
  }

  handleSubmit = (values: RejectLCForm, formikBag: FormikActions<RejectLCForm>) => {
    this.props.handleSubmit(values)
    if (!this.state.formikBag) {
      this.setState({ formikBag })
    }
  }

  cancel = (formikBag: FormikActions<RejectLCForm>) => {
    this.restartForm(formikBag)
    this.props.cancel()
  }

  restartForm = (formikBag: FormikActions<RejectLCForm>) => {
    formikBag!.resetForm({ rejectComment: '' })
  }

  validate = (values: RejectLCForm) => {
    const errors: any = {}
    Object.keys(values).forEach(valueName => {
      if (values[valueName] === null || values[valueName] === '') {
        errors[valueName] = 'Required'
      }
    })
    return errors
  }

  isSubmitting = () => {
    const { actions } = this.props
    return actions.name === ACTION_NAME.REJECT_LC && actions.status === ACTION_STATUS.PENDING
  }

  renderModalContent() {
    const { actions } = this.props

    return this.isSubmitting() ? (
      <LoadingTransition title="Rejecting application" marginTop="10px" />
    ) : (
      <>
        <p>
          You are about to Reject an LC application <b>{this.props.letter.reference}</b> from{' '}
          <b>{this.props.participantsNames.applicant}</b>
        </p>
        <Form>
          {actions.message &&
            actions.message !== '' &&
            actions.name === ACTION_NAME.REJECT_LC && <ErrorMessage title="Error" error={actions.message!} />}
          <Field
            name="rejectComment"
            render={({ field, form }: FieldProps<RejectLCForm>) => (
              <>
                <Form.TextArea
                  type="text"
                  {...field}
                  name="rejectComment"
                  label="Comment"
                  error={form.touched.rejectComment && form.errors.rejectComment ? true : false}
                />
                {form.touched.rejectComment &&
                  form.errors.rejectComment && (
                    <p className="error" style={{ marginTop: '-10px' }}>
                      {form.errors.rejectComment}
                    </p>
                  )}
              </>
            )}
          />
        </Form>
      </>
    )
  }

  render() {
    return (
      <Formik
        initialValues={{ rejectComment: '' }}
        onSubmit={this.handleSubmit}
        validate={this.validate}
        render={(formikBag: FormikProps<RejectLCForm>) => (
          <Modal size="small" open={this.props.show}>
            <Modal.Header>Reject LC application</Modal.Header>
            <Modal.Content>{this.renderModalContent()}</Modal.Content>
            <Modal.Actions>
              <Button onClick={() => this.cancel(formikBag)} content="Cancel" disabled={this.isSubmitting()} />
              <Button
                primary={true}
                type="submit"
                onClick={() => formikBag.handleSubmit()}
                content="Submit Rejection"
                disabled={!formikBag.isValid || this.isSubmitting()}
              />
            </Modal.Actions>
          </Modal>
        )}
      />
    )
  }
}

export default RejectModalLC
