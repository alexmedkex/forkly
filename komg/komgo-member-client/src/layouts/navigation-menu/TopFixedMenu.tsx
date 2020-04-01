import * as React from 'react'
import styled from 'styled-components'
import { Dropdown, Menu, Label } from 'semantic-ui-react'
import { User } from '../../store/common/types'
import {
  violet,
  violetBlue,
  darkPurple,
  navigationBorderPurple,
  pinkPurple,
  fadedRed,
  white
} from '../../styles/colors'
import { Link, NavLink } from 'react-router-dom'
import { yellow } from '@komgo/ui-components'
import { ReactComponent as NotificationIcon } from './../../styles/themes/komgo/assets/fonts/alarm-bell-1.svg'
import { ReactComponent as LogoIcon } from './../../styles/themes/komgo/assets/fonts/komgo-logo-yellow.svg'

export interface ITopFixedMenuProps {
  user: User
  sidebarExtended: boolean
  numberOfUnreadNotifications: number
  setSidebar(sidebarExtended: boolean): void
  logout(): void
}

interface State {
  menuOpen: boolean
}

export class TopFixedMenu extends React.Component<ITopFixedMenuProps, State> {
  constructor(props: ITopFixedMenuProps) {
    super(props)
    this.state = {
      menuOpen: false
    }
  }

  toggleNotificationBar = () => {
    this.props.setSidebar(!this.props.sidebarExtended)
  }

  displayNotificationsCountLabel = (): React.ReactNode => {
    const { numberOfUnreadNotifications } = this.props
    return (
      <NotificationWrapper onClick={this.toggleNotificationBar} data-test-id="notification-button">
        <NotificationIcon />
        {numberOfUnreadNotifications !== 0 && (
          <LabelWrapper>
            <Label floating={false} size="mini" circular={true}>
              {numberOfUnreadNotifications}
            </Label>
          </LabelWrapper>
        )}
      </NotificationWrapper>
    )
  }

  toggleMenuOpen = () => {
    this.setState({ menuOpen: !this.state.menuOpen })
  }

  renderUserInfoDropdownTrigger = () => {
    const { user } = this.props
    return (
      <UserMenuTrigger open={this.state.menuOpen}>
        <Hello>Hello</Hello>
        {user.firstName ? <UserName data-test-id="user-first-name">{user.firstName}</UserName> : null}
      </UserMenuTrigger>
    )
  }

  render() {
    const { logout } = this.props
    return (
      <div>
        <StyledDiv>
          <StyledDivItem />
          <StyledDivItem background={violetBlue} />
        </StyledDiv>
        <Logo>
          <NavLink to="/" exact={true}>
            <LogoIcon />
          </NavLink>
        </Logo>
        <NotificationAndUserInfoMenuItems>
          <StyledDropdown
            trigger={this.renderUserInfoDropdownTrigger()}
            item={true}
            icon={null}
            onMouseEnter={this.toggleMenuOpen}
            onMouseLeave={this.toggleMenuOpen}
            open={this.state.menuOpen}
          >
            <Dropdown.Menu>
              <Dropdown.Item>
                <Link to="/profile">My Account</Link>
              </Dropdown.Item>
              <Dropdown.Item onClick={logout} data-test-id="logout-button">
                Log out
              </Dropdown.Item>
            </Dropdown.Menu>
          </StyledDropdown>
          {!this.state.menuOpen && this.displayNotificationsCountLabel()}
        </NotificationAndUserInfoMenuItems>
        {this.state.menuOpen && <PurpleDimmer />}
        <StyledDivider />
      </div>
    )
  }
}

const PurpleDimmer = styled.div`
  background: ${violet};
  width: 240px;
  position: fixed;
  height: 100vh;
  z-index: 1;
  opacity: 0.7;
`

/*
  It is little bit strange but semantic addad a lot of important in dropdown styling when it is used in menu.
  In order to fix that we need to use !important here which is not that cool.
*/
const StyledDropdown = styled(Dropdown)`
  &&&&&&& {
    background: ${darkPurple};
    .menu {
      padding: 0;
      max-width: 300px;
      left: -30px;
      position: absolute;
      min-width: 240px;
      width: 240px;
      background: ${darkPurple};
      border: none;
      .item {
        color: white !important;
        font-size: 16px !important;
        padding-left: 30px !important;
        padding-right: 30px !important;
        a {
          padding: 0;
        }
        &:hover {
          background: ${darkPurple} !important;
        }
      }
    }
  }
`

const UserName = styled.p`
  font-size: 18px;
  font-weight: bolder;
  color: white !important;
  max-width: 150px;
`

const Hello = styled.span`
  color: ${pinkPurple};
  font-size: 12px;
`

const UserMenuTrigger = styled.div`
  background: ${(props: UserMenuTriggerProps) => (props.open ? darkPurple : violet)};
  padding: 10px 0;
  width: ${(props: UserMenuTriggerProps) => (props.open ? '240px' : '')};
  margin-left: ${(props: UserMenuTriggerProps) => (props.open ? '-30px' : 0)};
  padding-left: ${(props: UserMenuTriggerProps) => (props.open ? '30px' : 0)};
`

interface UserMenuTriggerProps {
  open: boolean
}

const NotificationWrapper = styled.div`
  &:hover {
    cursor: pointer;
  }
  position: relative;
`

const LabelWrapper = styled.div`
  position: absolute;
  top: -13px;
  left: -3px;
  margin-left: 15px;
  background: ${violet};
  padding: 2px;
  border-radius: 50px;
  .label {
    background: ${fadedRed};
    color: ${white};
  }
`

const NotificationAndUserInfoMenuItems = styled.div`
  padding: 0 30px;
  justify-content: space-between;
  display: flex;
  align-items: center;
  width: 100%;
  text-align: left;
  flex-grow: 0;
`

const StyledDivider = styled.div`
  border-top: 1px solid ${navigationBorderPurple};
  margin: 0 30px;
`

const StyledDiv = styled.div`
  display: flex;
  justify-content: flex-end;
  padding-right: 7px;
  overflow: hidden;
`
interface StyledDivItemProps {
  background?: string
}

const StyledDivItem = styled.div`
  width: 30px;
  height: 44px;
  background: ${(props: StyledDivItemProps) => props.background || yellow};
  transform: skew(150deg);
  margin-left: 7px;
`

export const Logo = styled(Menu.Item)`
  a,
  a:hover,
  &:hover {
    background: ${violet} !important;
  }
  margin-bottom: 20px;
`

export default TopFixedMenu
