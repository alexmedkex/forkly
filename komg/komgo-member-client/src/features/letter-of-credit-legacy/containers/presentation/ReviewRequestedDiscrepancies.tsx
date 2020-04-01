import * as React from 'react'
import { connect } from 'react-redux'
import { compose } from 'redux'
import { Modal } from 'semantic-ui-react'
import styled from 'styled-components'

import { ApplicationState } from '../../../../store/reducers'
import { getLetterOfCredit } from '../../store/actions'
import { withLoaders, WithLoaderProps } from '../../../../components/with-loaders'
import { LetterOfCreditActionType } from '../../store/types'
import { Task, TaskManagementActionType } from '../../../tasks/store/types'
import { getLcPresentationWithDocuments, findCommentForLCPresentationStatus } from '../../utils/selectors'
import { ILetterOfCredit } from '../../types/ILetterOfCredit'
import { ILCPresentation } from '../../types/ILCPresentation'
import { setTaskInModal } from '../../../tasks/store/actions'
import ReviewRequestedDiscrepanciesForm, {
  Response
} from '../../components/presentation/ReviewRequestedDiscrepanciesForm'
import { IMember } from '../../../members/store/types'
import { LoadingTransition, ErrorMessage } from '../../../../components'
import ReviewDiscrepanciesSubtitle from '../../components/presentation/ReviewDiscrepanciesSubtitle'
import { acceptRequestedDiscrepancies, rejectRequestedDiscrepancies } from '../../store/presentation/actions'
import { loadingSelector } from '../../../../store/common/selectors'
import { LCPresentationActionType } from '../../store/presentation/types'
import { findErrors } from '../../../../store/common/selectors/errorSelector'
import { ServerError } from '../../../../store/common/types'
import { clearError } from '../../../../store/common/actions'

export interface CommentForm {
  comment: string
}

interface IProps extends WithLoaderProps {
  task: Task | null
  presentation: ILCPresentation
  letterOfCredit: ILetterOfCredit
  members: IMember[]
  isSubmittingResponse: boolean
  submittingResponseError: ServerError[]
  getLetterOfCredit(params?: any): void
  setTaskInModal(task: null): any
  acceptRequestedDiscrepancies(presentation: ILCPresentation, lcId: string, data: CommentForm): void
  rejectRequestedDiscrepancies(presentation: ILCPresentation, lcId: string, data: CommentForm): void
  clearError(action: string): void
}

export class ReviewRequestedDiscrepancies extends React.Component<IProps> {
  componentDidMount() {
    const { task } = this.props
    if (task) {
      this.props.getLetterOfCredit({ id: task.context.lcid })
    }
  }

  handleSubmit = (response: Response, comment: string) => {
    const { presentation, letterOfCredit } = this.props
    if (response === Response.Accept) {
      this.props.acceptRequestedDiscrepancies(presentation, letterOfCredit._id, { comment })
    } else if (response === Response.Reject) {
      this.props.rejectRequestedDiscrepancies(presentation, letterOfCredit._id, { comment })
    }
  }

  closeModal = () => {
    this.props.setTaskInModal(null)
    this.clearErrors()
  }

  clearErrors = () => {
    const { submittingResponseError, clearError } = this.props
    if (submittingResponseError.length > 0) {
      clearError(LCPresentationActionType.ACCEPT_REQUESTED_DISCREPANCIES_REQUEST)
      clearError(LCPresentationActionType.REJECT_REQUESTED_DISCREPANCIES_REQUEST)
    }
  }

  render() {
    const { isFetching, errors, presentation, members, isSubmittingResponse, submittingResponseError } = this.props
    const [error] = errors
    const [submitError] = submittingResponseError
    return (
      <React.Fragment>
        {isFetching ? (
          <LoadingTransition title="Loading task and presentation" marginTop="60px" />
        ) : error ? (
          <ErrorMessage error={error.message} title="Error" />
        ) : (
          <React.Fragment>
            <Modal.Header>
              Document discrepancies
              <PresentationReference>Presentation: #{presentation.reference}</PresentationReference>
            </Modal.Header>
            <ContentWithSubtitle>
              <ReviewDiscrepanciesSubtitle presentation={presentation} members={members} />
              {submitError && !isSubmittingResponse && <ErrorMessage error={submitError.message} title="Error" />}
              {!isSubmittingResponse && (
                <Comment>
                  <b>Comment</b>
                  <p>{findCommentForLCPresentationStatus(presentation, presentation.status)}</p>
                </Comment>
              )}
            </ContentWithSubtitle>
            <ReviewRequestedDiscrepanciesForm
              close={this.closeModal}
              submit={this.handleSubmit}
              isSubmittingResponse={isSubmittingResponse}
            />
          </React.Fragment>
        )}
      </React.Fragment>
    )
  }
}

const mapStateToProps = (state: ApplicationState) => {
  const task = state.get('tasks').get('taskInModal')
  const members = state
    .get('members')
    .get('byId')
    .toList()
    .toJS()
  const { letterOfCredit, presentation } = getLcPresentationWithDocuments(
    state,
    task.context.lcid,
    task.context.lcPresentationStaticId
  )
  const isSubmittingResponse = loadingSelector(
    state.get('loader').get('requests'),
    [
      LCPresentationActionType.ACCEPT_REQUESTED_DISCREPANCIES_REQUEST,
      LCPresentationActionType.REJECT_REQUESTED_DISCREPANCIES_REQUEST
    ],
    false
  )
  const submittingResponseError = findErrors(state.get('errors').get('byAction'), [
    LCPresentationActionType.ACCEPT_REQUESTED_DISCREPANCIES_REQUEST,
    LCPresentationActionType.REJECT_REQUESTED_DISCREPANCIES_REQUEST
  ])
  return {
    task,
    letterOfCredit,
    presentation,
    members,
    isSubmittingResponse,
    submittingResponseError
  }
}

const ContentWithSubtitle = styled(Modal.Content)`
  &&& {
    padding-top: 10px;
    padding-bottom: 0;
  }
`

const Comment = styled.div`
  margin-top: 30px;
`

const PresentationReference = styled.h4`
  float: right;
  height: 29px;
  padding-top: 6px;
`

export default compose(
  withLoaders({
    actions: [LetterOfCreditActionType.LETTER_OF_CREDIT_REQUEST, TaskManagementActionType.TASKS_REQUEST]
  }),
  connect(mapStateToProps, {
    getLetterOfCredit,
    setTaskInModal,
    acceptRequestedDiscrepancies,
    rejectRequestedDiscrepancies,
    clearError
  })
)(ReviewRequestedDiscrepancies)
