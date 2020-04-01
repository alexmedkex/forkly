import * as React from 'react'
import Helmet from 'react-helmet'
import { connect } from 'react-redux'
import { RouteComponentProps } from 'react-router-dom'

import { TaskViewProperties, TaskWithUser } from '../store/types'
import { ApplicationState } from '../../../store/reducers'
import { getTask } from '../store/actions'

import { ErrorMessage, LoadingTransition } from '../../../components'
import { getTaskHandler, TaskViewComponentType, RedirectHandler } from './taskHandlerProvider'
import { Modal } from 'semantic-ui-react'
import { TaskComponent } from '../types'

interface MatchParams {
  id: string
}

interface TaskViewProps extends RouteComponentProps<MatchParams>, TaskViewProperties {
  getTask(id: string): any
}

export class TaskView extends React.Component<TaskViewProps> {
  componentDidMount() {
    this.props.getTask(this.props.match.params.id)
  }

  componentDidUpdate(prevProps: TaskViewProps) {
    if (this.props.match.params.id !== prevProps.match.params.id) {
      this.props.getTask(this.props.match.params.id)
    }

    if (this.props.task && !prevProps.task) {
      this.setTaskHandler()
    }
  }

  onModalClose = (status: boolean) => {
    this.props.history.push('/tasks')
  }

  setTaskHandler() {
    const { task } = this.props

    if (!task) {
      return
    }

    const taskHandler = getTaskHandler(task.task.taskType)

    if (!taskHandler) {
      return
    }

    if (taskHandler.mode === 'handler') {
      ;(taskHandler.handler as RedirectHandler)(task.task, this.props.history, true)

      return
    }

    this.setState({
      taskHandler
    })
  }

  renderTaskWorkflow(taskWithUser: TaskWithUser): JSX.Element | null {
    const { task, user } = taskWithUser
    const { taskHandler } = (this.state || {}) as any

    if (!taskHandler) {
      return <ErrorMessage title="Error" error={`Unknown task type "${task.taskType}"`} />
    }

    if (taskHandler.mode === 'task') {
      const TaskDisplayComponent = taskHandler.handler as React.SFC<TaskComponent>
      return <TaskDisplayComponent task={task} assignedUser={user} />
    }

    if (taskHandler.mode === 'modal') {
      const TaskModalComponent = taskHandler.handler as TaskViewComponentType

      return (
        <Modal open={true} size="small">
          <TaskModalComponent task={taskWithUser} actionCallback={this.onModalClose} />
        </Modal>
      )
    }

    return <ErrorMessage title="Error" error={`Unknown task type "${task.taskType}"`} />
  }

  render() {
    const { task: taskWithUser, taskError, taskFetching } = this.props

    return (
      <>
        <Helmet>
          <title>{taskWithUser ? `Task — ${taskWithUser.task.summary}` : 'Task'}</title>
        </Helmet>
        {taskFetching && <LoadingTransition title="Loading task" />}
        {taskError && <ErrorMessage title="Unable to load task" error={taskError} />}
        {taskWithUser && this.renderTaskWorkflow(taskWithUser)}
      </>
    )
  }
}

const mapStateToProps = (state: ApplicationState): TaskViewProperties => ({
  task: state.get('tasks').get('task'),
  taskError: state.get('tasks').get('taskError'),
  taskFetching: state.get('tasks').get('taskFetching')
})

const mapDispatchToProps = { getTask }

export default connect(mapStateToProps, mapDispatchToProps)(TaskView)
