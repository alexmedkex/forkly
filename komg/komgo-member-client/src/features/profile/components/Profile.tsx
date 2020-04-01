import * as React from 'react'
import Helmet from 'react-helmet'
import { Grid, Header, Tab, MenuItem } from 'semantic-ui-react'
import { Link, withRouter, RouteComponentProps } from 'react-router-dom'
import { connect, ActionCreator } from 'react-redux'
import { IChangePasswordRequest } from '@komgo/types'
import { ApplicationState } from '../../../store/reducers'
import { Profile as IProfile, ActionType } from '../../../store/common/types'
import styled from 'styled-components'
import { white, cloudyBlue } from '../../../styles/colors'
import { getRoles, ActionThunk } from '../../role-management/store/actions'
import { Role } from '../../role-management/store/types'
import NotificationsForm from './NotificationsForm'
import PasswordForm from './PasswordForm'
import { updateUserSettings, resetPassword } from '../../../store/common/actions'
import { compose } from 'redux'
import { withLoaders, WithLoaderProps } from '../../../components/with-loaders'

interface IActions {
  getRoles: ActionCreator<ActionThunk>
  updateUserSettings: ActionCreator<void>
  resetPassword: ActionCreator<void>
}

interface IProfileProps {
  profile: IProfile
  roles: Role[]
}

interface IState {
  activeIndex: number | string
}

export interface IProps extends IProfileProps, IActions, WithLoaderProps, RouteComponentProps<{}> {}

export class Profile extends React.Component<IProps, IState> {
  state = {
    activeIndex: 0
  }

  componentDidMount(): void {
    this.props.getRoles()
  }

  componentDidUpdate(): void {
    this.handleChange()
  }

  resetPassword = (values: IChangePasswordRequest) => {
    this.props.resetPassword(this.props.profile.id, values)
  }

  getRoleNames = (roleIds: string[], roles: Role[]) => {
    return roles
      .filter(role => roleIds.indexOf(role.id) !== -1)
      .map(role => role.label)
      .join(', ')
  }

  getTabs = ({ profile, updateUserSettings, errors }: IProps) => {
    return [
      {
        menuItem: (
          <MenuItem key="notification" as={Link} to="#notification">
            Notification
          </MenuItem>
        ),
        render: () => <NotificationsForm settings={profile.settings} updateUserSettings={updateUserSettings} />
      },
      {
        menuItem: (
          <MenuItem key="password" as={Link} to="#password">
            Password
          </MenuItem>
        ),
        render: () => <PasswordForm errors={errors} resetPassword={this.resetPassword} />
      }
    ]
  }

  handleChange = () => {
    const activeIndex = this.props.location.hash === '#password' ? 1 : 0

    if (this.state.activeIndex !== activeIndex) {
      this.setState({ activeIndex })
    }
  }

  render(): JSX.Element {
    const { profile, roles } = this.props

    return (
      <>
        <Helmet>
          <title>Profile & settings</title>
        </Helmet>
        <Grid>
          <Grid.Row>
            <Grid.Column>
              <Header as="h1">Profile & settings</Header>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <StyledColumn>
              <StyledProfileIcon>
                {profile.firstName[0]}
                {profile.lastName[0]}
              </StyledProfileIcon>
            </StyledColumn>
            <StyledColumnContent>
              <Grid.Row>
                <Grid.Column>
                  <StyledName>
                    {profile.firstName} {profile.lastName}
                  </StyledName>
                  <p>{profile.roles && this.getRoleNames(profile.roles, roles)}</p>
                </Grid.Column>
                <Grid.Column>
                  <StyledTab activeIndex={this.state.activeIndex} panes={this.getTabs(this.props)} />
                </Grid.Column>
              </Grid.Row>
            </StyledColumnContent>
          </Grid.Row>
        </Grid>
      </>
    )
  }
}

const mapStateToProps = (state: ApplicationState): IProfileProps => ({
  profile: state.get('uiState').get('profile'),
  roles: state
    .get('roleManagement')
    .get('roles')
    .toArray()
})

const mapDispatchToProps: IActions = { getRoles, updateUserSettings, resetPassword }

export default compose(
  withLoaders({
    actions: [ActionType.ResetPasswordRequest]
  }),
  withRouter,
  connect<IProfileProps, IActions>(mapStateToProps, mapDispatchToProps)
)(Profile)

const StyledColumn = styled(Grid.Column)`
  &&&&& {
    width: 112px;
  }
`

const StyledColumnContent = styled(Grid.Column)`
  &&&&& {
    width: calc(100% - 112px);
  }
`

const StyledProfileIcon = styled.div`
  font-size: 42px;
  border-radius: 50%;
  width: 90px;
  height: 90px;
  padding-top: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${white};
  background-color: #8f69b9;
`

const StyledName = styled.p`
  && {
    margin: 10px 0 0;
    font-size: 21px;
  }
`

const StyledTab = styled(Tab)`
  &&& {
    .attached.tabular.menu {
      border-bottom: 1px solid ${cloudyBlue}
      margin-top: 2rem;
      .item {
        padding-left: 0;
        font-weight: bold;
        border: none;
        margin: 0;
      }
    }
  }
`
