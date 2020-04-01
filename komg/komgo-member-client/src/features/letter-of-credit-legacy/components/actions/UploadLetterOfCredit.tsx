import * as React from 'react'
import { Formik, FormikProps, Field, FieldProps, FormikActions } from 'formik'
import { Form, Modal, Button } from 'semantic-ui-react'
import { ErrorMessage } from '../../../../components/error-message'
import { UploadLCForm, ActionType, LetterOfCreditParticipantNames } from '../../store/types'
import { FileUpload } from '../../../../components/form'
import { ACTION_STATUS, ACTION_NAME } from '../../constants'
import { ILetterOfCredit } from '../../types/ILetterOfCredit'
import { LoadingTransition } from '../../../../components'

interface Props {
  isOpenUploadModal: boolean
  actions: ActionType
  letterOfCredit: ILetterOfCredit
  participantsNames: LetterOfCreditParticipantNames
  handleToggleUploadModal: () => void
  create: (uploadLCFormData: UploadLCForm, id: string) => void
}

interface State {
  formikBag?: FormikActions<UploadLCForm>
}

class UploadLetterOfCredit extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      formikBag: undefined
    }
  }

  componentDidUpdate(oldProps: Props) {
    const { actions } = this.props
    if (
      actions.name === ACTION_NAME.ISSUE_BANK_ISSUE_LC &&
      actions.status !== oldProps.actions.status &&
      actions.status === ACTION_STATUS.FINISHED
    ) {
      this.restartForm()
    }
  }

  handleSubmit = (values: UploadLCForm, formikBag: FormikActions<UploadLCForm>) => {
    this.props.create(values, this.props.letterOfCredit._id!)
    if (!this.state.formikBag) {
      this.setState({ formikBag })
    }
  }

  closeModal = () => {
    this.props.handleToggleUploadModal()
  }

  restartForm = () => {
    this.state.formikBag!.resetForm({ issuingBankLCReference: '', fileLC: null })
  }

  validate = (values: UploadLCForm) => {
    const errors: any = {}
    Object.keys(values).forEach(valueName => {
      if (values[valueName] === null || values[valueName] === '') {
        errors[valueName] = 'Required'
      }
    })
    return errors
  }

  isErrorActive = (fieldName: string, form: any): boolean => {
    return form.touched[fieldName] && form.errors[fieldName] ? true : false
  }

  printShareMsg = (
    formikBag: FormikProps<UploadLCForm>,
    letterOfCredit: ILetterOfCredit,
    participantsNames: LetterOfCreditParticipantNames
  ) => {
    if (formikBag.isValid) {
      return (
        <p>
          You are about to share {formikBag.values.fileLC ? <b>{formikBag.values.fileLC.name}</b> : null} with
          counterparties: <b>{participantsNames.applicant}</b>,{' '}
          {letterOfCredit.beneficiaryBankId ? (
            <b>{participantsNames.beneficiaryBank}</b>
          ) : (
            <b>{participantsNames.beneficiary}</b>
          )}{' '}
          when clicking submit approval
        </p>
      )
    }
    return null
  }

  isSubmitting = () => {
    const { actions } = this.props
    return actions.name === ACTION_NAME.ISSUE_BANK_ISSUE_LC && actions.status === ACTION_STATUS.PENDING
  }

  renderModalContent(formikBag: FormikProps<UploadLCForm>) {
    const { actions, letterOfCredit, participantsNames } = this.props

    return this.isSubmitting() ? (
      <LoadingTransition title="Issuing Letter of Credit" marginTop="10px" />
    ) : (
      <>
        <p>
          You are about to approve LC application for the financing of <b>{letterOfCredit.reference}</b> from{' '}
          <b>{participantsNames.applicant}</b>
        </p>
        <Form>
          {actions.message &&
            actions.message !== '' &&
            actions.name === ACTION_NAME.ISSUE_BANK_ISSUE_LC && <ErrorMessage title="Error" error={actions.message!} />}
          <Field
            name="issuingBankLCReference"
            render={({ field, form }: FieldProps<UploadLCForm>) => (
              <>
                <Form.Input
                  type="text"
                  name="issuingBankLCReference"
                  {...field}
                  label="Issuing Bank LC Reference"
                  error={this.isErrorActive('issuingBankLCReference', form)}
                />
                {form.touched.issuingBankLCReference &&
                  form.errors.issuingBankLCReference && (
                    <p className="error" style={{ marginTop: '-10px' }}>
                      {form.errors.issuingBankLCReference}
                    </p>
                  )}
              </>
            )}
          />
          <Field
            name="fileLC"
            render={({ field, form }: FieldProps<UploadLCForm>) => (
              <Form.Field>
                <FileUpload
                  label="Upload LC to complete approval"
                  name="fileLC"
                  accept=".pdf, .png, .jpeg"
                  onChange={formikBag.setFieldValue}
                  file={formikBag.values.fileLC}
                  uploadFileText="Upload issued LC"
                />
                {form.touched.fileLC &&
                  form.errors.fileLC && (
                    <p className="error" style={{ marginTop: '-10px' }}>
                      {form.errors.fileLC}
                    </p>
                  )}
              </Form.Field>
            )}
          />
          {this.printShareMsg(formikBag, letterOfCredit, participantsNames)}
        </Form>
      </>
    )
  }

  render() {
    return (
      <Formik
        initialValues={{ issuingBankLCReference: '', fileLC: null }}
        onSubmit={this.handleSubmit}
        validate={this.validate}
        render={(formikBag: FormikProps<UploadLCForm>) => (
          <Modal dimmer={true} open={this.props.isOpenUploadModal} onClose={this.props.handleToggleUploadModal}>
            <Modal.Header>Approve LC application</Modal.Header>
            <Modal.Content>{this.renderModalContent(formikBag)}</Modal.Content>
            <Modal.Actions>
              <Button
                onClick={() => {
                  formikBag.resetForm()
                  this.closeModal()
                }}
                disabled={this.isSubmitting()}
                content="Cancel"
              />
              <Button
                primary={true}
                onClick={() => formikBag.handleSubmit()}
                type="submit"
                disabled={!formikBag.isValid || this.isSubmitting()}
                content="Submit Approval"
              />
            </Modal.Actions>
          </Modal>
        )}
      />
    )
  }
}

export default UploadLetterOfCredit
