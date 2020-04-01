import * as React from 'react'
import styled, { css } from 'styled-components'
import { compose } from 'redux'
import { connect } from 'react-redux'
import { withRouter, RouteComponentProps } from 'react-router-dom'
import { Label, Icon, Popup } from 'semantic-ui-react'

import { setSidebarExtended } from '../../../store/common/actions'
import { markAsRead } from '../../notifications/store/actions'
import { Notification, TypeContextEnum } from '../../notifications/store/types'
import { paleGrey, blueGrey } from '../../../styles/colors'
import { displayDateAndTime } from '../../../utils/date'
import { getNotificationHandler, RedirectHandler } from './notificationHandlerProvider'
import { TaskWithUser, TaskStatus, Task } from '../../tasks/store/types'
import TaskDetailsModal from '../../tasks/components/TaskDetailsModal'
import { setTaskInModal } from '../../tasks/store/actions'
import { LetterOfCreditTaskType } from '../../letter-of-credit-legacy/constants/taskType'

interface NotificationProp {
  notification: Notification
  task?: TaskWithUser
}

export interface NotificationItemProps extends NotificationProp, RouteComponentProps<{}> {
  markAsRead: (id: string, isRead: boolean) => void
  setSidebarExtended: (sidebarExtended: boolean) => void
  setTaskInModal: (task: Task | null) => any
}

const ItemWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 15px 30px;
  cursor: pointer;

  &:hover {
    background: ${paleGrey};
  }

  ${(props: NotificationProp) =>
    props.notification.isRead &&
    css`
      > * {
        opacity: 0.35 !important;
      }
    `};
`

const LabelWrapper = styled(Label)`
  &&& {
    min-width: 42px !important;
    text-align: center;
    padding-left: unset;
    padding-right: unset;
  }
`

const Content = styled.div`
  overflow: hidden;
  font-weight: bold;
  flex-grow: 1;
  padding: 0 15px;
`

const Message = styled.div`
  line-height: 17px;
  overflow: hidden;
  margin-bottom: 2px;
`
const Date = styled.div`
  font-size: 12px;
  color: ${blueGrey};
`

const MarkReadIcon = styled(Icon)`
  min-width: 25px !important;
`

interface State {
  taskDetails?: TaskWithUser
}

export class NotificationItem extends React.Component<NotificationItemProps, State> {
  globalModalTasks: any[] = [LetterOfCreditTaskType.REVIEW_PRESENTATION_DISCREPANCIES]

  constructor(props: NotificationItemProps) {
    super(props)
    this.onClick = this.onClick.bind(this)
    this.onMarkAsRead = this.onMarkAsRead.bind(this)
    this.onViewDetailsClose = this.onViewDetailsClose.bind(this)
    this.onViewDetailsOpen = this.onViewDetailsOpen.bind(this)
    this.handleTaskClick = this.handleTaskClick.bind(this)
    this.state = { taskDetails: undefined }
  }

  onViewDetailsClose() {
    this.setState({ taskDetails: undefined })
  }

  onViewDetailsOpen(task: TaskWithUser) {
    this.setState({ taskDetails: task })
  }

  handleTaskClick() {
    const { task, notification, history, setTaskInModal } = this.props
    if (task.task.status === TaskStatus.Done) {
      this.onViewDetailsOpen(this.props.task)
    } else if (this.globalModalTasks.includes(task.task.taskType)) {
      setTaskInModal(task.task)
    } else {
      history.push(`/tasks/${notification.context.taskId}`)
    }
  }

  onClick() {
    const { context, _id } = this.props.notification
    if (context) {
      switch (context.type) {
        case TypeContextEnum.TaskPayload:
          if (this.props.task) {
            this.handleTaskClick()
          }
          break
        case TypeContextEnum.ReceivedDocumentsContext:
          this.props.history.push({
            pathname: '/review',
            state: { requestId: context.receivedDocumentsId }
          })
          break
        default:
          break
      }
    }
    const notificationHandler = getNotificationHandler(this.props.notification.type)
    if (notificationHandler) {
      ;(notificationHandler as RedirectHandler)(this.props.notification, this.props.history)
    }
    this.props.setSidebarExtended(false)
    this.props.markAsRead(_id, true)
  }

  onMarkAsRead(e: React.MouseEvent<HTMLElement>) {
    e.stopPropagation()
    const { _id, isRead } = this.props.notification
    this.props.markAsRead(_id, !isRead)
  }

  render() {
    const notif = this.props.notification
    const isTask = notif.context && notif.context.type === TypeContextEnum.TaskPayload
    return (
      <>
        <TaskDetailsModal taskDetails={this.state.taskDetails} onViewDetailsClose={this.onViewDetailsClose} />
        <ItemWrapper onClick={this.onClick} notification={notif} data-test-id="notif-item" data-test-notif={notif._id}>
          <LabelWrapper color={notif.isRead ? 'grey' : isTask ? 'violet' : 'green'} data-test-id="notif-label">
            {isTask ? 'task' : 'info'}
          </LabelWrapper>
          <Content className="content">
            <Message data-test-id="notif-message">{notif.message}</Message>
            <Date data-test-id="notif-date">{displayDateAndTime(notif.createdAt)}</Date>
          </Content>
          <Popup
            inverted={true}
            size="mini"
            position="bottom center"
            trigger={<MarkReadIcon onClick={this.onMarkAsRead} size="large" name="dot circle outline" />}
            content={`Mark as ${notif.isRead ? 'unread' : 'read'}`}
          />
        </ItemWrapper>
      </>
    )
  }
}

const mapDispatchToProps = { markAsRead, setSidebarExtended, setTaskInModal }

const NotificationItemWrapped = compose(withRouter, connect(null, mapDispatchToProps))(
  NotificationItem
) as React.ComponentType<NotificationProp>

export default NotificationItemWrapped
