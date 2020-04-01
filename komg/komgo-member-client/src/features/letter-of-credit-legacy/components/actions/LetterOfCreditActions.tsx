import * as React from 'react'
import { Button } from 'semantic-ui-react'
import { UploadLCForm, ActionType } from '../../store/types'
import UploadLetterOfCredit from './UploadLetterOfCredit'
import { Task } from '../../../tasks/store/types'
import { ACTION_STATUS, RejectLCForm, ACTION_NAME } from '../../constants'
import RejectModalLC from './RejectModalLC'
import AcceptLC from './AcceptLC'
import { IMember } from '../../../members/store/types'
import { findParticipantCommonNames } from '../../../financial-instruments/utils/selectors'
import styled from 'styled-components'
import { paleBlue } from '../../../../styles/colors'
import { tradeFinanceManager } from '@komgo/permissions'
import { PermissionFullId } from '../../../role-management/store/types'
import { LetterOfCreditTaskType } from '../../constants/taskType'
import { history } from '../../../../store/history'
import { ILetterOfCreditEnriched } from '../../containers/LetterOfCreditDashboard'
import BottomFixedActions from '../../../../components/bottom-fixed-actions/BottomFixedActions'

interface IProps {
  letterOfCredit: ILetterOfCreditEnriched
  actions: ActionType
  members: IMember[]
  tasks: Task[]
  isAuthorized: (requiredPerm: PermissionFullId) => boolean
  create: (uploadLCFormData: UploadLCForm, id: string) => void
  reject: (rejectLCForm: RejectLCForm, letterOfCredit: ILetterOfCreditEnriched, task: Task) => void
  accept: (letterOfCredit: ILetterOfCreditEnriched) => void
  restartActions: () => void
}

interface IState {
  isOpenUploadModal: boolean
  isOpenRejectModal: boolean
  isOpenAcceptModal: boolean
  activeTaskId: string
}

class LetterOfCreditActions extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props)
    this.state = {
      isOpenUploadModal: false,
      isOpenRejectModal: false,
      isOpenAcceptModal: false,
      activeTaskId: ''
    }
  }

  componentDidUpdate(oldProps: IProps) {
    if (this.props.actions.status !== oldProps.actions.status) {
      if (this.props.actions.status === ACTION_STATUS.FINISHED) {
        this.restartModals()
      }
      if (
        this.props.actions.status === ACTION_STATUS.FINISHED &&
        (this.props.actions.name === ACTION_NAME.ISSUE_BANK_ISSUE_LC ||
          this.props.actions.name === ACTION_NAME.REJECT_LC ||
          this.props.actions.name === ACTION_NAME.ACCEPT_LC)
      ) {
        history.push('/financial-instruments')
      }
    }
  }

  restartModals = () => {
    this.setState({
      isOpenUploadModal: false,
      isOpenRejectModal: false,
      isOpenAcceptModal: false,
      activeTaskId: ''
    })
    this.props.restartActions()
  }

  handleToggleUploadModal = (taskId: string = '') => {
    this.setState({
      isOpenUploadModal: !this.state.isOpenUploadModal,
      activeTaskId: taskId
    })
    this.restartActions()
  }

  handleToggleRejectModal = (taskId: string = '') => {
    this.setState({
      isOpenRejectModal: !this.state.isOpenRejectModal,
      activeTaskId: taskId
    })
    this.restartActions()
  }

  handleToggleAcceptModal = (taskId: string = '') => {
    this.setState({
      isOpenAcceptModal: !this.state.isOpenAcceptModal,
      activeTaskId: taskId
    })
    this.restartActions()
  }

  handleSubmitReject = (rejectLCForm: RejectLCForm) => {
    const activeTask = this.props.tasks.find(task => task._id === this.state.activeTaskId)
    this.props.reject(rejectLCForm, this.props.letterOfCredit, activeTask!)
  }

  handleAcceptLC = () => {
    this.props.accept(this.props.letterOfCredit)
  }

  restartActions = () => {
    if (this.props.actions.message && this.props.actions.message !== '') {
      this.props.restartActions()
    }
  }

  renderModals() {
    const participantsNames = findParticipantCommonNames(this.props.letterOfCredit, this.props.members)
    return (
      <React.Fragment>
        <UploadLetterOfCredit
          isOpenUploadModal={this.state.isOpenUploadModal}
          handleToggleUploadModal={this.handleToggleUploadModal}
          create={this.props.create}
          actions={this.props.actions}
          letterOfCredit={this.props.letterOfCredit}
          participantsNames={participantsNames}
        />
        <RejectModalLC
          show={this.state.isOpenRejectModal}
          letter={this.props.letterOfCredit}
          cancel={this.handleToggleRejectModal}
          actions={this.props.actions}
          handleSubmit={this.handleSubmitReject}
          participantsNames={participantsNames}
        />
        <AcceptLC
          show={this.state.isOpenAcceptModal}
          handleAcceptLC={this.handleAcceptLC}
          handleToggleAcceptModal={this.handleToggleAcceptModal}
          letterOfCredit={this.props.letterOfCredit}
          actions={this.props.actions}
        />
      </React.Fragment>
    )
  }

  canExecute(task: Task): boolean {
    switch (task.taskType) {
      case LetterOfCreditTaskType.REVIEW_APPLICATION:
        return this.props.isAuthorized(tradeFinanceManager.canReadWriteReviewLCApp)
      case LetterOfCreditTaskType.REVIEW_ISSUED:
        return this.props.isAuthorized(tradeFinanceManager.canReadWriteReviewIssuedLC)
      default:
        return true
    }
  }

  renderButton(action: string, task: Task) {
    switch (action) {
      case ACTION_NAME.REJECT_LC:
        return (
          <Button
            negative={true}
            key={action + task._id!}
            disabled={!this.canExecute(task)}
            onClick={() => this.handleToggleRejectModal(task._id)}
          >
            Reject LC
          </Button>
        )
      case ACTION_NAME.ISSUE_BANK_ISSUE_LC:
        return (
          <Button
            primary={true}
            key={action + task._id!}
            disabled={!this.canExecute(task)}
            onClick={() => this.handleToggleUploadModal(task._id)}
          >
            Issue LC
          </Button>
        )
      case ACTION_NAME.ACCEPT_LC:
        return (
          <Button
            primary={true}
            key={action + task._id!}
            disabled={!this.canExecute(task)}
            onClick={() => this.handleToggleAcceptModal(task._id)}
          >
            Accept LC
          </Button>
        )
      default:
        return null
    }
  }

  shouldRenderActionsWrapper = (tasks: Task[]) => {
    let shouldReturn = false
    tasks.forEach(task => {
      task.actions.forEach(action => {
        if (
          action === ACTION_NAME.REJECT_LC ||
          action === ACTION_NAME.ISSUE_BANK_ISSUE_LC ||
          action === ACTION_NAME.ACCEPT_LC
        ) {
          shouldReturn = true
        }
      })
    })
    return shouldReturn
  }

  render() {
    const { tasks, isAuthorized } = this.props
    if (this.shouldRenderActionsWrapper(tasks)) {
      return (
        <BottomFixedActions>
          <Actions>
            {tasks.map(task => task.actions.map(action => this.renderButton(action, task)))}
            {this.renderModals()}
          </Actions>
        </BottomFixedActions>
      )
    }
    return null
  }
}

export const Actions = styled.div`
  float: right;
`

export default LetterOfCreditActions
