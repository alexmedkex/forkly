import * as React from 'react'
import { Form, Radio, CheckboxProps, TextArea, TextAreaProps, Button, Confirm } from 'semantic-ui-react'
import styled from 'styled-components'
import * as H from 'history'
import { ServerError } from '../../../../store/common/types'
import { ILCPresentation } from '../../types/ILCPresentation'
import { LCPresentationActionType, LCPresentationStatus } from '../../store/presentation/types'
import { IMember } from '../../../members/store/types'
import { findMemberName } from '../../utils/selectors'
import ContentWithLoaderAndError from '../../../../components/content-with-loader-and-error/ContentWithLoaderAndError'
import { PRESENTATION_DOCUMENT_STATUS } from '../../constants'
import BottomFixedActions from '../../../../components/bottom-fixed-actions/BottomFixedActions'

export interface DiscrepantForm {
  comment: string
}

export enum NextAction {
  ProvideNoticeOfDiscrepancies = 'Provide notice of discrepancies',
  RequestWaiverOfDiscrepancies = 'Request waiver of discrepancies from applicant'
}

interface IProps {
  presentation: ILCPresentation
  allDocumentsReviewed: boolean
  numberOfRejectedDocuments: number
  history: H.History
  members: IMember[]
  isReviewingPresentation: boolean
  reviewingPresentationError: ServerError[]
  setPresentationDocumentsCompliant(): void
  clearError(action: string): void
  setPresentationDocumentsDiscrepant(data: DiscrepantForm): void
  requestWaiverOfDiscrepancies(data: DiscrepantForm): void
}

interface IState {
  isCompliant: boolean
  comment: string
  open: boolean
  nextAction: NextAction
}

class ReviewPresentationDocumentsForm extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props)
    this.state = {
      isCompliant: props.numberOfRejectedDocuments === 0,
      open: false,
      comment: '',
      nextAction: NextAction.ProvideNoticeOfDiscrepancies
    }
  }

  setIsDocumentCompliant = (_: React.FormEvent<HTMLInputElement>, data: CheckboxProps) => {
    this.setState(
      {
        isCompliant: data.value === PRESENTATION_DOCUMENT_STATUS.COMPLIANT
      },
      this.restartNextActionAndComment
    )
  }

  setComment = (_: React.FormEvent<HTMLTextAreaElement>, data: TextAreaProps) => {
    this.setState({
      comment: data.value as string
    })
  }

  setNextAction = (_: React.FormEvent<HTMLInputElement>, data: CheckboxProps) => {
    this.setState({
      nextAction: data.value as NextAction
    })
  }

  restartNextActionAndComment = () => {
    if (this.state.isCompliant) {
      this.setState({
        comment: '',
        nextAction: NextAction.ProvideNoticeOfDiscrepancies
      })
    }
  }

  openConfirm = () => {
    this.setState({
      open: true
    })
  }

  closeConfirm = () => {
    this.setState({
      open: false
    })
    this.clearErrors()
  }

  clearErrors = () => {
    const { clearError } = this.props
    clearError(LCPresentationActionType.SET_PRESENTATION_DOCUMENTS_DISCREPANT_REQUEST)
    clearError(LCPresentationActionType.SET_PRESENTATION_DOCUMENTS_COMPLIANT_REQUEST)
    clearError(LCPresentationActionType.REQ_WAIVER_OF_DISCREPANCIES_REQUEST)
  }

  renderCompliantConfirmContent() {
    const { presentation } = this.props
    return <p>You are about to deem documents for presentation #{presentation.reference} as compliant</p>
  }

  renderDiscrepantConfirmContent() {
    const { presentation, members } = this.props
    return (
      <div>
        <p>
          You are about to deem documents for presentation #{presentation.reference} as discrepant. A notice of
          discrepancy will be shared with {findMemberName(presentation.beneficiaryId, members)}.
        </p>
        {this.state.comment && (
          <p>
            <b>Comment:</b>
            <br />
            {this.state.comment}
          </p>
        )}
      </div>
    )
  }

  renderWavierOfDiscrepanciesContent = () => {
    const { presentation, members } = this.props
    return (
      <div>
        <p>
          You are about to request a waiver of discrepancies from {findMemberName(presentation.applicantId, members)}{' '}
          for presentation #{presentation.reference}.
        </p>
        {this.state.comment && (
          <p>
            <b>Comment:</b>
            <br />
            {this.state.comment}
          </p>
        )}
      </div>
    )
  }

  confirm = () => {
    const { isCompliant, nextAction, comment } = this.state
    const {
      setPresentationDocumentsCompliant,
      requestWaiverOfDiscrepancies,
      setPresentationDocumentsDiscrepant
    } = this.props
    if (isCompliant) {
      setPresentationDocumentsCompliant()
    } else if (nextAction === NextAction.RequestWaiverOfDiscrepancies) {
      requestWaiverOfDiscrepancies({ comment })
    } else {
      setPresentationDocumentsDiscrepant({ comment })
    }
  }

  getConfirmHeader = () => {
    const { isCompliant, nextAction } = this.state
    return isCompliant
      ? 'Deem documents compliant'
      : nextAction === NextAction.RequestWaiverOfDiscrepancies
        ? 'Advise discrepancies'
        : 'Deem documents discrepant'
  }

  getLoaderText = () => {
    const { isCompliant, nextAction } = this.state
    return isCompliant
      ? 'Setting up documents as compliant'
      : nextAction === NextAction.RequestWaiverOfDiscrepancies
        ? 'Requesting waiver of discrepancies'
        : 'Setting up documents as discrepant'
  }

  render() {
    const { isCompliant, comment, open, nextAction } = this.state
    const {
      allDocumentsReviewed,
      numberOfRejectedDocuments,
      history,
      isReviewingPresentation,
      reviewingPresentationError,
      presentation
    } = this.props
    return (
      <div>
        <StyledForm>
          <Form.Field>
            <b>Presentation status:</b>
          </Form.Field>
          {numberOfRejectedDocuments > 0 && (
            <Form.Field>
              <p>You can deem presentation as compliant only when all documents are deemed as compliant.</p>
            </Form.Field>
          )}
          <Form.Field>
            <Radio
              label="Document(s) compliant"
              name="isCompliant"
              value={PRESENTATION_DOCUMENT_STATUS.COMPLIANT}
              checked={isCompliant}
              onChange={this.setIsDocumentCompliant}
              disabled={!allDocumentsReviewed || numberOfRejectedDocuments !== 0}
              data-test-id="documents-compliant"
            />
          </Form.Field>
          <Form.Field>
            <Radio
              label="Document(s) discrepant"
              name="isCompliant"
              value={PRESENTATION_DOCUMENT_STATUS.DISCREPANT}
              checked={!isCompliant}
              onChange={this.setIsDocumentCompliant}
              disabled={!allDocumentsReviewed}
              data-test-id="documents-discrepant"
            />
          </Form.Field>
          {isCompliant === false && (
            <React.Fragment>
              {presentation.status === LCPresentationStatus.DocumentsPresented && (
                <React.Fragment>
                  <Form.Field>
                    <b>Next action</b>
                  </Form.Field>
                  <Form.Field>
                    <Radio
                      label={NextAction.ProvideNoticeOfDiscrepancies}
                      name="nextAction"
                      value={NextAction.ProvideNoticeOfDiscrepancies}
                      checked={this.state.nextAction === NextAction.ProvideNoticeOfDiscrepancies}
                      onChange={this.setNextAction}
                      disabled={!allDocumentsReviewed}
                      data-test-id="next-action-provide-notice-of-discrepancies"
                    />
                  </Form.Field>
                  <Form.Field>
                    <Radio
                      label={NextAction.RequestWaiverOfDiscrepancies}
                      name="nextAction"
                      value={NextAction.RequestWaiverOfDiscrepancies}
                      checked={this.state.nextAction === NextAction.RequestWaiverOfDiscrepancies}
                      onChange={this.setNextAction}
                      disabled={!allDocumentsReviewed}
                      data-test-id="next-action-request-waiver-of-discrepancies"
                    />
                  </Form.Field>
                </React.Fragment>
              )}
              <Form.Field>
                <TextArea name="comment" id="comment" value={comment} onChange={this.setComment} />
              </Form.Field>
            </React.Fragment>
          )}
          <BottomFixedActions style={{ left: '190px' }}>
            <Button
              primary={true}
              floated="right"
              onClick={this.openConfirm}
              disabled={!allDocumentsReviewed}
              data-test-id="complete-review"
            >
              Complete review
            </Button>
            <Button onClick={history.goBack} floated="right" data-test-id="cancel-review">
              Cancel
            </Button>
          </BottomFixedActions>
        </StyledForm>
        <Confirm
          open={open}
          header={this.getConfirmHeader()}
          content={
            <div className="content">
              <ContentWithLoaderAndError
                isLoading={isReviewingPresentation}
                loadingProps={{
                  title: this.getLoaderText(),
                  marginTop: '15px'
                }}
                errors={reviewingPresentationError}
              >
                <React.Fragment>
                  {isCompliant
                    ? this.renderCompliantConfirmContent()
                    : nextAction === NextAction.RequestWaiverOfDiscrepancies
                      ? this.renderWavierOfDiscrepanciesContent()
                      : this.renderDiscrepantConfirmContent()}
                </React.Fragment>
              </ContentWithLoaderAndError>
            </div>
          }
          onCancel={this.closeConfirm}
          onConfirm={this.confirm}
          cancelButton={
            <Button content="Cancel" disabled={isReviewingPresentation} data-test-id="cancel-confirm-review" />
          }
          confirmButton={
            <Button primary={true} content="Confirm" disabled={isReviewingPresentation} data-test-id="confirm-review" />
          }
        />
      </div>
    )
  }
}

export const StyledForm = styled(Form)`
  padding-bottom: 64px;
`

export default ReviewPresentationDocumentsForm
