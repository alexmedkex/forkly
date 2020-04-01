import * as React from 'react'
import { connect } from 'react-redux'
import { Button } from 'semantic-ui-react'
import styled from 'styled-components'

import { blueGrey } from '../../../styles/colors'
import { ErrorMessage, LoadingTransition } from '../../../components'
import { ApplicationState } from '../../../store/reducers'
import { getNotifications } from '../../notifications/store/actions'
import { NotificationStateFields, TypeContextEnum } from '../../notifications/store/types'
import { TaskWithUser } from '../../tasks/store/types'
import { Notification } from '../../notifications/store/types'
import { getTasks } from '../../tasks/store/actions'

import NotificationItem from './NotificationItem'

const NOTIFICATION_PAGE_COUNT = 10

interface NotificationProps extends NotificationStateFields {
  tasks: TaskWithUser[]
  getNotifications: (offset: number, limit: number) => any
  getTasks(): (params?: {}) => null
}

interface NotificationState {
  offset: number
  limit: number
}

const NoNotifications = styled.div`
  text-align: center;
  color: ${blueGrey};
  margin-top: 30px;
`

const Wrapper = styled.div`
  margin-top: 90px;
  z-index: -1;
  overflow-y: auto;
`

export class Notifications extends React.Component<NotificationProps, NotificationState> {
  constructor(props: NotificationProps) {
    super(props)
    this.state = { offset: 0, limit: NOTIFICATION_PAGE_COUNT }
    this.handleMoreClick = this.handleMoreClick.bind(this)
  }

  componentDidMount() {
    this.props.getNotifications(this.state.offset, this.state.limit)
    this.props.getTasks()
  }

  handleMoreClick(e: React.MouseEvent) {
    this.setState({ limit: this.state.limit + NOTIFICATION_PAGE_COUNT }, () => {
      this.props.getNotifications(this.state.offset, this.state.limit)
    })
  }

  findTaskAssociated(n: Notification) {
    const { context } = n
    if (context && context.type === TypeContextEnum.TaskPayload) {
      return this.props.tasks.find(t => t.task._id === context.taskId)
    }
    return undefined
  }

  render() {
    const { notifications, notificationsError, notificationsFetching, totalCount } = this.props
    return (
      <Wrapper>
        {notificationsError && <ErrorMessage title="Unable to load notifications" error={notificationsError} />}
        {notificationsFetching && notifications.length === 0 && <LoadingTransition title="Loading notifications" />}
        {!notificationsError &&
          !notificationsFetching &&
          !notifications.length && <NoNotifications>You don't have any notifications</NoNotifications>}
        {notifications.length > 0 &&
          notifications.map(notif => (
            <NotificationItem key={notif._id} notification={notif} task={this.findTaskAssociated(notif)} />
          ))}
        {notifications.length > 0 &&
          notifications.length < totalCount && (
            <Button primary={true} fluid={true} onClick={this.handleMoreClick} style={{ borderRadius: 0 }}>
              Load More...
            </Button>
          )}
      </Wrapper>
    )
  }
}

const mapStateToProps = (state: ApplicationState) => ({
  notifications: state.get('notifications').get('notifications'),
  notificationsFetching: state.get('notifications').get('notificationsFetching'),
  notificationsError: state.get('notifications').get('notificationsError'),
  unreadCount: state.get('notifications').get('unreadCount'),
  totalCount: state.get('notifications').get('totalCount'),
  tasks: state.get('tasks').get('tasks')
})

const mapDispatchToProps = { getNotifications, getTasks }

export default connect(mapStateToProps, mapDispatchToProps)(Notifications)
