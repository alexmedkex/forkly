import { Icon, Menu, Popup, Dropdown } from 'semantic-ui-react'
import { Link } from 'react-router-dom'
import * as React from 'react'
import { ILetterOfCreditEnriched } from '../../containers/LetterOfCreditDashboard'
import { Task, TaskContextType } from '../../../tasks/store/types'
import {
  shouldBeHandle,
  resolveTaskTitle,
  resolveTaskLink,
  resolveTaskTitleForLCPresentation,
  shouldHandleInModal
} from '../../utils/taskUtils'
import { ILetterOfCreditStatus } from '../../types/ILetterOfCredit'
import { Roles } from '../../constants/roles'
import { LetterOfCreditTaskType } from '../../constants/taskType'
import { STEP } from '../../../letter-of-credit-legacy/constants'

interface IProps {
  letter: ILetterOfCreditEnriched
  // TODO LS TMP FEATURE FLAG  */
  featureRequestLCAmendment?: boolean
  openTaskModal(task: Task): void
}

interface IState {
  open: boolean
}

export class ActionsMenu extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props)
    this.state = {
      open: false
    }
  }

  openDropdown = () => {
    this.setState({
      open: true
    })
  }

  closeDropdown = () => {
    this.setState({
      open: false
    })
  }

  openModal = (task: Task) => {
    this.closeDropdown()
    this.props.openTaskModal(task)
  }

  canRequestLCAmendment = (status, role) => {
    return (
      ![
        ILetterOfCreditStatus.REQUEST_REJECTED,
        ILetterOfCreditStatus.ISSUED_LC_REJECTED,
        ILetterOfCreditStatus.INITIALISING
      ].includes(status) &&
      role === Roles.APPLICANT &&
      this.props.featureRequestLCAmendment !== undefined
    )
  }

  getLCTasks = () => {
    const escapeLcTasks = [LetterOfCreditTaskType.MANAGE_PRESENTATION, LetterOfCreditTaskType.VIEW_PRESENTED_DOCUMENTS]
    const { tasks } = this.props.letter
    return tasks && tasks.length > 0
      ? tasks.filter(
          t => t.context.type === TaskContextType.LC && !escapeLcTasks.includes(t.taskType as LetterOfCreditTaskType)
        )
      : []
  }

  renderTasksInModal = (task: Task, tasks: Task[]) => {
    return (
      <Dropdown.Item key={task._id} onClick={() => this.openModal(task)} data-test-id={`open-modal-${task._id}`}>
        {' '}
        {task.context.type === TaskContextType.LCPresentation
          ? resolveTaskTitleForLCPresentation(tasks, task)
          : resolveTaskTitle(task.taskType)}
      </Dropdown.Item>
    )
  }

  renderCommonTasks = (task: Task, tasks: Task[]) => {
    return (
      <Dropdown.Item key={task._id}>
        <Link className="link-as-text" to={resolveTaskLink(task, task._id, this.props.letter._id)}>
          {task.context.type === TaskContextType.LCPresentation
            ? resolveTaskTitleForLCPresentation(tasks, task)
            : resolveTaskTitle(task.taskType)}
        </Link>
      </Dropdown.Item>
    )
  }

  render() {
    const { letter } = this.props
    const { tasks, role, status, hasPresentationTask } = letter
    const lcTasks = this.getLCTasks()

    const [managePresentationTask] = tasks.filter(t => t.taskType === LetterOfCreditTaskType.MANAGE_PRESENTATION)
    const [viewPresentedDocumentsTask] = tasks.filter(
      t => t.taskType === LetterOfCreditTaskType.VIEW_PRESENTED_DOCUMENTS
    )
    return (
      <Dropdown
        inline={true}
        icon={'ellipsis horizontal'}
        direction={'left'}
        open={this.state.open}
        onClose={this.closeDropdown}
        onOpen={this.openDropdown}
      >
        <Dropdown.Menu>
          {lcTasks.length === 0 && (
            <Dropdown.Item>
              <Link className="link-as-text" to={`/financial-instruments/letters-of-credit/${letter._id}`}>
                View LC application
              </Link>
            </Dropdown.Item>
          )}
          {this.canRequestLCAmendment(status, role) && (
            <Dropdown.Item>
              <Link
                className="link-as-text"
                to={`/financial-instruments/letters-of-credit/${letter._id}/amendments/new`}
              >
                Request LC Amendment
              </Link>
            </Dropdown.Item>
          )}
          {tasks.map(
            (task: Task) =>
              shouldBeHandle(task.taskType)
                ? this.renderCommonTasks(task, tasks)
                : shouldHandleInModal(task.taskType)
                  ? this.renderTasksInModal(task, tasks)
                  : null
          )}
          {viewPresentedDocumentsTask && (
            <Dropdown.Item>
              <Link
                className="link-as-text"
                to={`/financial-instruments/letters-of-credit/${letter._id}?step=${STEP.LC_DOCUMENTS}`}
              >
                View presented documents
              </Link>
            </Dropdown.Item>
          )}
          {!managePresentationTask &&
            hasPresentationTask && (
              <Dropdown.Item>
                <Link
                  className="link-as-text"
                  to={`/financial-instruments/letters-of-credit/${letter._id}/presentations`}
                >
                  View presentations
                </Link>
              </Dropdown.Item>
            )}
        </Dropdown.Menu>
      </Dropdown>
    )
  }
}
