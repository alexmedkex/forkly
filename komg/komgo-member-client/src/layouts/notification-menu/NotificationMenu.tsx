import * as React from 'react'
import styled from 'styled-components'
import { connect, Dispatch } from 'react-redux'
import { bindActionCreators } from 'redux'
import { Menu, Header, Divider, Sidebar, Icon } from 'semantic-ui-react'

import { Notifications, markAllAsRead } from '../../features/notifications'
import { ApplicationState } from '../../store/reducers'
import { setSidebarExtended } from '../../store/common/actions'
import { blueGrey } from '../../styles/colors'

interface Props {
  numberOfUnreadNotifications: number
  sidebarExtended: boolean
  setSidebar(sidebarExtended: boolean): any
  markAllAsRead(): any
}

const Wrapper = styled.div`
  &&& {
    position: absolute;
    width: 100%;
    background-color: white;
    z-index: 100000;
  }
`

export class NotificationMenu extends React.Component<Props> {
  closeSidebar = () => {
    this.props.setSidebar(false)
  }

  markAllAsRead = () => {
    this.props.markAllAsRead()
  }

  render() {
    const { numberOfUnreadNotifications, sidebarExtended } = this.props
    return (
      <StyledSidebar
        as={Menu}
        animation="overlay"
        vertical={true}
        borderless={true}
        visible={sidebarExtended}
        onHide={this.closeSidebar}
        width="very wide"
      >
        <Wrapper>
          <NotificationHeader>
            <CloseButton onClick={this.closeSidebar}>
              <Icon name="arrow left" />
            </CloseButton>
            Notifications
            {numberOfUnreadNotifications !== 0 && (
              <MarkNotificationText onClick={this.markAllAsRead}>Mark all as read</MarkNotificationText>
            )}
          </NotificationHeader>
          <StyledDivider />
        </Wrapper>
        <Notifications />
      </StyledSidebar>
    )
  }
}

export const CloseButton = styled.span`
  position: absolute;
  left: 1rem;
  top: 2rem;
  cursor: pointer;
  line-height: 23px;
`

export const NotificationHeader = styled(Header)`
  &&& {
    text-align: left;
    padding-left: 1rem;
    margin: 2rem;
  }
`

const StyledDivider = styled(Divider)`
  &&& {
    margin-bottom: 0;
  }
`

export const MarkNotificationText = styled.button`
  &&& {
    cursor: pointer;
    border: none;
    position: absolute;
    background: none;
    color: ${blueGrey};
    opacity: 0.9;
    right: 1rem;
    top: 2.4rem;
    font-size: 0.7em;

    &:hover {
      opacity: 1;
    }
  }
`

const StyledSidebar: any = styled(Sidebar)`
  &&&& {
    display: flex;
    flex-direction: column;
    position: fixed;
    ::-webkit-scrollbar {
      width: 0;
    }
    -ms-overflow-style: none;
  }
`

const mapStateToProps = (state: ApplicationState) => ({
  sidebarExtended: state.get('uiState').get('sidebarExtended'),
  numberOfUnreadNotifications: state.get('notifications').get('unreadCount')
})

const mapDispatchToProps = (dispatch: Dispatch) =>
  bindActionCreators({ setSidebar: setSidebarExtended, markAllAsRead }, dispatch)

export default connect(mapStateToProps, mapDispatchToProps)(NotificationMenu)
