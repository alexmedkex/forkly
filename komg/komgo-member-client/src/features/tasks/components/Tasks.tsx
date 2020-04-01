import * as React from 'react'
import Helmet from 'react-helmet'
import { Dropdown, Grid } from 'semantic-ui-react'
import { Tab, Modal, Button } from 'semantic-ui-react'
import { getTasks, updateTaskAssignee, setTaskInModal } from '../store/actions'
import { withRouter } from 'react-router'
import { compose } from 'redux'
import { connect } from 'react-redux'
import styled from 'styled-components'

import TaskDetailsModal from './TaskDetailsModal'
import { TaskViewComponentType, getTaskHandler, RedirectHandler } from './taskHandlerProvider'

import { ApplicationState } from '../../../store/reducers'
import { Task, TaskStatus, TaskWithUser, TaskListProperties, TaskManagementActionType } from '../store/types'
import { TabPane } from '../components'
import { ErrorMessage, LoadingTransition } from '../../../components'
import { getUsers } from '../../../store/common/actions'
import { User } from '../../../store/common/types'
import { IMember } from '../../members/store/types'
import { loadingSelector } from '../../../store/common/selectors'
import ReviewContainer from '../../review-documents/containers/ReviewContainter'

const StyledTab = styled(Tab)`
  .ui.bottom.attached.segment.active.tab {
    border: none;
    box-shadow: none;
  }
`

enum Tabs {
  allTasks = 'All',
  newTasks = 'To Do',
  inProgressTasks = 'In Progress',
  completeTasks = 'Complete'
}

interface TaskProps extends TaskListProperties {
  history: any // string[]
  getTasks: (params?: {}) => any
  updateTaskAssignee: (id: string, assignee?: string) => any
  getUsers: (productId?: string, actionId?: string) => any
  setTaskInModal: (task: Task) => void
}

interface State {
  activeState: Tabs
  tasks: TaskWithUser[]
  newTasks: TaskWithUser[]
  inProgressTasks: TaskWithUser[]
  completedTasks: TaskWithUser[]
  taskDetails?: TaskWithUser
  activeTask?: {
    task: TaskWithUser
    Component: TaskViewComponentType
  }
  showAssignPopup: boolean
  currentTask?: Task
  selectedAssignee?: string
  showReviewModal: boolean
}

export class Tasks extends React.Component<TaskProps, State> {
  constructor(props: TaskProps) {
    super(props)
    this.viewDetails = this.viewDetails.bind(this)
    this.onOpenTask = this.onOpenTask.bind(this)
    this.onViewDetailsClose = this.onViewDetailsClose.bind(this)
    this.taskActionCallback = this.taskActionCallback.bind(this)

    this.state = {
      tasks: [],
      newTasks: [],
      inProgressTasks: [],
      completedTasks: [],
      activeState: Tabs.allTasks,
      taskDetails: undefined,
      showAssignPopup: false,
      currentTask: undefined,
      selectedAssignee: '',
      activeTask: undefined,
      showReviewModal: false
    }
  }

  componentDidMount() {
    this.props.getTasks()
  }

  viewDetails(task: TaskWithUser) {
    this.setState({ taskDetails: task })
  }

  onViewDetailsClose() {
    this.setState({ taskDetails: undefined })
  }

  onAssigneeToMe = (task: Task) => {
    if (task && task.assignee !== this.props.profile.id) {
      this.props.updateTaskAssignee(task._id, this.props.profile.id)
    }
  }

  onAssigneeTo = (task: Task) => {
    this.setState({ showAssignPopup: true, currentTask: task, selectedAssignee: task.assignee })
    this.props.getUsers(task.requiredPermission.productId, task.requiredPermission.actionId)
  }

  onAssigneeToClose = () => {
    this.setState({ showAssignPopup: false })
  }

  onAssigneeSet = (event: any, { value }: { value: string }) => {
    this.setState({ selectedAssignee: value })
  }

  onAssigneeChanged = () => {
    if (this.state.currentTask && this.state.currentTask.assignee !== this.state.selectedAssignee) {
      this.props.updateTaskAssignee(
        this.state.currentTask._id,
        this.state.selectedAssignee !== 'Unassigned' ? this.state.selectedAssignee : ''
      )
    }
    this.setState({ showAssignPopup: false })
  }

  options = (users: User[]): User[] | any => {
    const usersOptions = users.map(el => {
      return { text: el.username, value: el.id }
    })
    return [{ text: 'Unassigned', value: 'Unassigned' }, ...usersOptions]
  }

  onOpenTask(task: TaskWithUser) {
    const taskHandler = getTaskHandler(task.task.taskType)
    if (!taskHandler || taskHandler.mode === 'task') {
      if (task.task.taskType === 'KYC.ReviewDocuments') {
        this.setState({ showReviewModal: !this.state.showReviewModal })
      } else if (task.task.taskType === 'KYC.DocRequest') {
        this.props.history.push({
          pathname: '/incoming-request',
          state: { requestId: task.task.context.requestId }
        })
      } else {
        this.props.history.push(`/tasks/${task.task._id}`)
        return
      }
    }

    if (taskHandler!.mode === 'globalModal') {
      this.props.setTaskInModal(task.task)
    }

    if (taskHandler!.mode === 'modal') {
      this.setState({
        activeTask: {
          task,
          Component: taskHandler!.handler as TaskViewComponentType
        }
      })

      return
    }

    if (taskHandler!.mode === 'handler') {
      ;(taskHandler!.handler as RedirectHandler)(task.task, this.props.history)
    }
  }

  taskActionCallback(status: boolean): void {
    if (status) {
      this.props.getTasks()
    }

    this.setState({ activeTask: undefined })
  }

  render() {
    const { tasks, tasksError, tasksFetching } = this.props
    const { taskDetails, showAssignPopup, activeTask } = this.state

    const newTasks = tasks.filter(tws => tws.task.status === TaskStatus.ToDo)
    const inProgressTasks = tasks.filter(tws => tws.task.status === TaskStatus.InProgress)
    const completeTasks = tasks.filter(tws => tws.task.status === TaskStatus.Done)

    return (
      <>
        <Helmet>
          <title>Tasks</title>
        </Helmet>
        {tasksFetching ? (
          <LoadingTransition title="Loading tasks" />
        ) : (
          <>
            {tasksError && <ErrorMessage title="Unable to load tasks" error={tasksError} />}
            <h1>Tasks</h1>
            <StyledTab
              menu={{ secondary: true, pointing: true }}
              panes={this.getPanes(tasks, newTasks, inProgressTasks, completeTasks)}
            />
            <TaskDetailsModal taskDetails={taskDetails} onViewDetailsClose={this.onViewDetailsClose} />
            {this.modalAssignee(showAssignPopup)}
          </>
        )}
        <Modal open={activeTask !== undefined} onClose={this.onViewDetailsClose} size="small">
          {activeTask && <activeTask.Component task={activeTask.task} actionCallback={this.taskActionCallback} />}
        </Modal>
        {this.state.showReviewModal && <ReviewContainer />}
      </>
    )
  }

  private modalAssignee(showAssignPopup: boolean) {
    const modalAssignee = (
      <Modal open={showAssignPopup} onClose={this.onAssigneeToClose}>
        {showAssignPopup && (
          <>
            <Modal.Header style={{ padding: '30px 30px 20px 30px' }}>Assign task</Modal.Header>
            <Modal.Content style={{ padding: '0px 30px 30px 30px' }}>
              {this.props.availableUsers && (
                <>
                  <Grid columns={1}>
                    <Grid.Column width={16}>
                      <p style={{ fontWeight: 600 }}>Choose an assignee</p>
                      <StyledDropdown
                        inline={true}
                        button={true}
                        defaultValue={
                          this.state.currentTask && this.state.currentTask.assignee
                            ? this.state.currentTask.assignee
                            : 'Unassigned'
                        }
                        scrolling={true}
                        options={this.options(this.props.availableUsers)}
                        onChange={this.onAssigneeSet}
                        style={{ minWidth: '460px' }}
                      />
                    </Grid.Column>
                  </Grid>
                </>
              )}
            </Modal.Content>
            <Modal.Actions>
              <Button onClick={this.onAssigneeToClose}>Cancel</Button>
              <Button
                className="ui button primary"
                primary={true}
                onClick={this.onAssigneeChanged}
                disabled={
                  this.state.currentTask &&
                  (this.state.currentTask.assignee === this.state.selectedAssignee ||
                    (!this.state.currentTask.assignee && this.state.selectedAssignee === 'Unassigned'))
                }
              >
                Assign task
              </Button>
            </Modal.Actions>
          </>
        )}
      </Modal>
    )
    return modalAssignee
  }

  private getPanes(
    tasks: TaskWithUser[],
    newTasks: TaskWithUser[],
    inProgressTasks: TaskWithUser[],
    completeTasks: TaskWithUser[]
  ) {
    const panes = [
      this.getTabPane(tasks, Tabs.allTasks),
      this.getTabPane(newTasks, Tabs.newTasks),
      this.getTabPane(inProgressTasks, Tabs.inProgressTasks),
      this.getTabPane(completeTasks, Tabs.completeTasks)
    ]
    return panes
  }

  private getTabPane(tasks: TaskWithUser[], title: string) {
    return {
      menuItem: `${title} (${tasks.length})`,
      render: () => (
        <TabPane
          onViewDetailsClick={this.viewDetails}
          onAssigneeToMe={this.onAssigneeToMe}
          onAssigneeTo={this.onAssigneeTo}
          onOpenTaskClick={this.onOpenTask}
          tasks={tasks}
        />
      )
    }
  }
}

const companyNameByStaticIdSelector = (tasks: TaskWithUser[], members: IMember[]): TaskWithUser[] => {
  return tasks.map(task => {
    if (task.task.counterpartyStaticId) {
      const member = members[task.task.counterpartyStaticId]
      if (member) {
        task.task.counterpartyName = member.x500Name.CN
      }
    }
    return task
  })
}

const mapStateToProps = (state: ApplicationState) => {
  const tasksFetching = loadingSelector(state.get('loader').get('requests'), [TaskManagementActionType.TASKS_REQUEST])
  return {
    tasksFetching,
    availableUsers: state.get('uiState').get('users'),
    profile: state.get('uiState').get('profile'),
    tasks: companyNameByStaticIdSelector(
      state.get('tasks').get('tasks'),
      state
        .get('members')
        .get('byStaticId')
        .toJS()
    ),
    tasksError: state.get('tasks').get('tasksError')
  }
}

const StyledDropdown = styled(Dropdown)`
  &&&&& {
    .dropdown.icon {
      float: right;
    }
  }
`

const mapDispatchToProps = { getTasks, updateTaskAssignee, getUsers, setTaskInModal }

export default compose(withRouter, connect(mapStateToProps, mapDispatchToProps))(Tasks)
