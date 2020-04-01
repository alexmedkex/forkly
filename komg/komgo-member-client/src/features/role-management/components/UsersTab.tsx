import * as React from 'react'
import { Icon, Button } from 'semantic-ui-react'
import styled from 'styled-components'
import { Field, FieldProps } from 'formik'

import { User } from '../../../store/common/types'
import { CustomSearch, withPermissions, WithPermissionsProps } from '../../../components'
import { administration } from '@komgo/permissions'

import { RoleForm } from '../store/types'

const UsersWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`
const UserSelectWrapper = styled.div`
  flex-grow: 1;
`
const StyledList = styled.ul`
  &&& {
    height: 200px;
    padding: 0.62em 0.71428571em;
    list-style: none;
    margin: 0;
    overflow-x: hidden;
    overflow-y: scroll;
    border: 1px solid #dbe5ec;

    li {
      margin: 3px 0;
      padding: 2px 6px;
      cursor: pointer;
    }

    li.selected-user {
      background-color: #f2f5f8;
    }
  }
`

const StyledSearch: any = styled(CustomSearch)`
  &&& {
    width: 100%;
    div {
      width: 100%;
      margin: 0;
      padding: 0;
    }

    input,
    input:focus {
      border-radius: 0;
      border-color: #dbe5f7;
      border-bottom: none;
    }
  }
`

const StyledLabel = styled.div`
  font-weight: bold;
  padding-bottom: 5px;
`
const Buttons = styled.div`
  width: 70px;

  &&& {
    button {
      margin: 10px 20px;
    }
  }
`

type FormikUsersProps = FieldProps<RoleForm> & WithPermissionsProps

interface FormikUsersState {
  availableSelected: string[]
  assignedSelected: string[]
  filterAvailableUsers: string
  filterAssignedUsers: string
}

export class FormikUsers extends React.Component<FormikUsersProps, FormikUsersState> {
  constructor(props: FormikUsersProps) {
    super(props)

    this.state = {
      availableSelected: [],
      assignedSelected: [],
      filterAvailableUsers: '',
      filterAssignedUsers: ''
    }
  }

  /**
   * Update internal state with users that are selected in the Available Users list
   */
  onAvailableSelectedChanged = (id: string) => {
    const isSelected = this.state.availableSelected.some(userId => userId === id)

    this.setState(prevState => ({
      availableSelected: isSelected
        ? prevState.availableSelected.filter(userId => userId !== id)
        : [...prevState.availableSelected, id]
    }))
  }

  /**
   * Update internal state with users that are selected in the Assigned Users list
   */
  onAssignedSelectedChanged = (id: string) => {
    const isSelected = this.state.assignedSelected.some(userId => userId === id)

    this.setState(prevState => ({
      assignedSelected: isSelected
        ? prevState.assignedSelected.filter(userId => userId !== id)
        : [...prevState.assignedSelected, id]
    }))
  }

  moveToAssigned = (e: React.FormEvent<HTMLElement>) => {
    e.preventDefault()
    const { form } = this.props
    const { currentlyAssigned, toBeAssigned, toBeUnassigned } = form.values.users
    form.setFieldValue('users', {
      ...form.values.users,
      toBeAssigned: toBeAssigned.union(this.state.availableSelected).subtract(currentlyAssigned),
      toBeUnassigned: toBeUnassigned.subtract(this.state.availableSelected)
    })
    this.setState({ availableSelected: [] })
  }

  moveToUnassigned = (e: React.FormEvent<HTMLElement>) => {
    e.preventDefault()
    const { form } = this.props
    const { currentlyAssigned, toBeAssigned, toBeUnassigned } = form.values.users
    form.setFieldValue('users', {
      ...form.values.users,
      toBeAssigned: toBeAssigned.subtract(this.state.assignedSelected),
      toBeUnassigned: toBeUnassigned.union(this.state.assignedSelected).intersect(currentlyAssigned)
    })
    this.setState({ assignedSelected: [] })
  }

  getAvailableUsers = (): User[] => {
    const { userById, all, currentlyAssigned, toBeAssigned, toBeUnassigned } = this.props.form.values.users
    return all
      .subtract(currentlyAssigned)
      .subtract(toBeAssigned)
      .union(toBeUnassigned)
      .map((userId: string) => userById.get(userId))
      .toArray()
      .filter(user => this.matchUserName(this.state.filterAvailableUsers, user))
  }

  getAssignedUsers = (): User[] => {
    const { userById, currentlyAssigned, toBeAssigned, toBeUnassigned } = this.props.form.values.users
    return currentlyAssigned
      .subtract(toBeUnassigned)
      .union(toBeAssigned)
      .map((userId: string) => userById.get(userId))
      .toArray()
      .filter(user => this.matchUserName(this.state.filterAssignedUsers, user))
  }

  filterAvailableUsers = event => {
    const value = event.target.value
    this.setState({ filterAvailableUsers: value })
  }

  filterAssignedUsers = event => {
    const value = event.target.value
    this.setState({ filterAssignedUsers: value })
  }

  matchUserName = (enteredName, user) => {
    return (
      (user.firstName && user.firstName.toLowerCase().search(enteredName.toLocaleLowerCase()) !== -1) ||
      (user.lastName && user.lastName.toLowerCase().search(enteredName.toLocaleLowerCase()) !== -1) ||
      (!user.firstName && !user.lastName)
    )
  }

  render() {
    const { form, isAuthorized } = this.props

    if (form.values.users.all.size === 0) {
      // wait until formik populates form values
      return null
    }

    return (
      <UsersWrapper>
        <UserSelectWrapper>
          <StyledLabel>Available users</StyledLabel>
          <StyledSearch handleSearch={this.filterAvailableUsers} />
          <StyledList id="users-available">
            {this.getAvailableUsers().map(user => (
              <li
                key={user.id}
                className={this.state.availableSelected.some(id => id === user.id) ? 'selected-user' : ''}
                onClick={() => this.onAvailableSelectedChanged(user.id)}
              >
                {user.firstName} {user.lastName}
              </li>
            ))}
          </StyledList>
        </UserSelectWrapper>
        <Buttons>
          <Button
            disabled={!isAuthorized(administration.canCrudRoles)}
            id="assign-button"
            icon={true}
            onClick={this.moveToAssigned}
          >
            <Icon name="arrow right" />
          </Button>
          <Button
            disabled={!isAuthorized(administration.canCrudRoles)}
            id="unassign-button"
            icon={true}
            onClick={this.moveToUnassigned}
          >
            <Icon name="arrow left" />
          </Button>
        </Buttons>
        <UserSelectWrapper>
          <StyledLabel>Assigned users</StyledLabel>
          <StyledSearch handleSearch={this.filterAssignedUsers} />
          <StyledList id="users-assigned">
            {this.getAssignedUsers().map(user => (
              <li
                key={user.id}
                className={this.state.assignedSelected.some(id => id === user.id) ? 'selected-user' : ''}
                onClick={() => this.onAssignedSelectedChanged(user.id)}
              >
                {user.firstName} {user.lastName}
              </li>
            ))}
          </StyledList>
        </UserSelectWrapper>
      </UsersWrapper>
    )
  }
}

const UsersTab: React.SFC<{}> = () => <Field name="users" component={withPermissions(FormikUsers)} />

export default UsersTab
