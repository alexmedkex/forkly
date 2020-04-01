import * as React from 'react'
import Helmet from 'react-helmet'
import { connect } from 'react-redux'
import { compose } from 'redux'
import { Route, Switch, RouteComponentProps } from 'react-router-dom'
import { Table, Button, Grid, Header, SearchProps } from 'semantic-ui-react'
import styled from 'styled-components'

import { administration } from '@komgo/permissions'
import { ApplicationState } from '../../../store/reducers'
import { stringOrNull } from '../../../utils/types'
import {
  CustomSearch,
  ErrorMessage,
  withPermissions,
  WithPermissionsProps,
  Unauthorized,
  LoadingTransition
} from '../../../components'

import { getRoles } from '../store/actions'
import { Role } from '../store/types'
import RoleRow from './RoleRow'
import EditRolePage from './EditRolePage'
import { newRoleRouteId } from '../constants'

const StyledGrid = styled(Grid)`
  &&& {
    margin-bottom: 15px;
  }
`

export const MutedCenteredText = styled.div`
  color: gray;
  text-align: center;
  margin: 2em;
  font-size: 110%;
`

interface RoleManagementProps extends RouteComponentProps<{}>, WithPermissionsProps {
  roles: Role[]
  getRolesError: stringOrNull
  rolesFetching: boolean
  getRoles: () => any
  searchRole: (query: string) => any
}

interface RoleManagementState {
  searchRole: string
}

export class Roles extends React.Component<RoleManagementProps, RoleManagementState> {
  constructor(props: RoleManagementProps) {
    super(props)
    this.renderList = this.renderList.bind(this)
    this.state = {
      searchRole: ''
    }
  }

  componentDidMount() {
    this.props.getRoles()
  }

  handleSearch = (event: React.MouseEvent<HTMLElement>, data: SearchProps): void => {
    this.setState({ searchRole: data.value })
  }

  onAddNewClick = (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault()
    this.props.history.push(`/roles/${newRoleRouteId}`)
  }

  escapeRegExp = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // $& means the whole matched string

  filterRoles = (role: Role): boolean => {
    const query = this.state.searchRole
    if (!query) {
      return true
    }

    const re = new RegExp(this.escapeRegExp(query), 'ig')
    return !!role.label.match(re) || !!(role.description && role.description.match(re))
  }

  renderList() {
    const title = 'Role management'

    const { getRolesError, rolesFetching, isAuthorized } = this.props

    const roles = this.props.roles.filter(this.filterRoles)

    if (!isAuthorized(administration.canReadRoles)) {
      return <Unauthorized />
    }

    return (
      <>
        <Helmet>
          <title>{title}</title>
        </Helmet>
        <StyledGrid>
          <Grid.Column width={8}>
            <Header as="h1">{title}</Header>
          </Grid.Column>
          <Grid.Column width={8} style={{ textAlign: 'right' }}>
            <CustomSearch handleSearch={this.handleSearch} disabled={false} />
            {isAuthorized(administration.canCrudRoles) && (
              <Button onClick={this.onAddNewClick} primary={true}>
                Add New
              </Button>
            )}
          </Grid.Column>
        </StyledGrid>

        {getRolesError && <ErrorMessage title="Unable to load roles" error={getRolesError} />}
        {rolesFetching && <LoadingTransition title="Loading roles" />}
        {!getRolesError && !rolesFetching && roles.length ? (
          <Table basic="very" singleLine={true}>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Title</Table.HeaderCell>
                <Table.HeaderCell>Type</Table.HeaderCell>
                <Table.HeaderCell>Description</Table.HeaderCell>
                <Table.HeaderCell />
              </Table.Row>
            </Table.Header>

            <Table.Body>{roles.map(role => <RoleRow key={role.id} role={role} />)}</Table.Body>
          </Table>
        ) : (
          !rolesFetching && <MutedCenteredText>Roles not found</MutedCenteredText>
        )}
      </>
    )
  }

  render() {
    return (
      <Switch>
        <Route exact={true} path="/roles/" render={this.renderList} />
        <Route exact={true} path="/roles/:id" component={EditRolePage} />
      </Switch>
    )
  }
}

const mapStateToProps = (state: ApplicationState) => ({
  roles: state
    .get('roleManagement')
    .get('roles')
    .toArray(),
  rolesFetching: state.get('roleManagement').get('rolesFetching'),
  getRolesError: state.get('roleManagement').get('getRolesError')
})

const mapDispatchToProps = { getRoles }

export default compose<any>(withPermissions, connect(mapStateToProps, mapDispatchToProps))(Roles)
