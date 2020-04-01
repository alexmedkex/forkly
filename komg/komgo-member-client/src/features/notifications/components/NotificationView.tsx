import React from 'react'
import { RouteComponentProps } from 'react-router-dom'
import { getNotificationHandler, RedirectHandler } from './notificationHandlerProvider'
import { Notification, ActionType } from '../store/types'
import { ApplicationState } from '../../../store/reducers'
import { connect } from 'react-redux'
import { getNotification } from '../store/actions'
import { compose } from 'redux'
import { withLoaders, WithLoaderProps } from '../../../components/with-loaders'
import { LoadingTransition, ErrorMessage } from '../../../components'

interface MatchParams {
  id: string
}

export interface NotificationViewProps extends RouteComponentProps<MatchParams>, WithLoaderProps {
  notification: Notification
  getNotification(id: string): any
}

export class NotificationView extends React.Component<NotificationViewProps> {
  componentDidMount() {
    this.props.getNotification(this.props.match.params.id)
  }

  componentDidUpdate(prevProps: NotificationViewProps) {
    if (this.props.match.params.id !== prevProps.match.params.id) {
      this.props.getNotification(this.props.match.params.id)
    }

    if (this.props.notification && !prevProps.notification) {
      const notificationHandler = getNotificationHandler(this.props.notification.type)
      if (notificationHandler) {
        ;(notificationHandler as RedirectHandler)(this.props.notification, this.props.history)
      }
    }
  }

  render() {
    const { isFetching, errors } = this.props
    const [error] = errors

    if (isFetching) {
      return <LoadingTransition title="Loading notification" />
    }

    if (error) {
      return <ErrorMessage title="Notification could not be presented" error={error} />
    }

    return <></>
  }
}

const mapStateToProps = (state: ApplicationState) => ({
  notification: state.get('notifications').get('notification')
})

const mapDispatchToProps = { getNotification }

export default compose<any>(
  withLoaders({
    actions: [ActionType.GET_SINGLE_NOTIFICATION_REQUEST]
  }),
  connect(mapStateToProps, mapDispatchToProps)
)(NotificationView)
