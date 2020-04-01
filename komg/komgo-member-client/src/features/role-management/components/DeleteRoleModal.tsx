import * as React from 'react'
import { connect } from 'react-redux'
import { Modal, Button } from 'semantic-ui-react'
import styled from 'styled-components'
import { ApplicationState } from '../../../store/reducers'

import { Role, DeleteRoleState, RoleUsersState } from '../store/types'
import { deleteRole, getRoleUsers } from '../store/actions'
import { ErrorMessage, LoadingTransition } from '../../../components'

interface DeleteRoleModalProps extends DeleteRoleState, RoleUsersState {
  role: Role
  deleteRole: (role: Role, onSuccess: () => void) => any
  getRoleUsers: (roleId: string) => any
  onDeleteModalClose: () => any
}

const StyledLoadingTransition = styled(LoadingTransition)`
  margin-top: 0;
  padding-bottom: 50px;
`

export class DeleteRoleModal extends React.Component<DeleteRoleModalProps> {
  componentDidMount() {
    this.props.getRoleUsers(this.props.role.id)
  }

  onDeleteConfirmed = () => {
    this.props.deleteRole(this.props.role, this.props.onDeleteModalClose)
  }

  renderWarning = (role, roleUsers) => (
    <>
      <p>
        You are about to delete the user role <b>{role.label}</b>
      </p>
      <p>
        <b>{roleUsers.size}</b> {roleUsers.size === 1 ? 'user is' : 'users are'} currently assigned to this role
      </p>
    </>
  )

  render() {
    const {
      role,
      deleteRoleFetching,
      deleteRoleError,
      onDeleteModalClose,
      roleUsers,
      roleUsersFetching,
      roleUsersError
    } = this.props
    const canDisplayMessage = !deleteRoleFetching && !roleUsersFetching && !deleteRoleError

    return (
      <Modal open={true} onClose={onDeleteModalClose}>
        <Modal.Header>Delete user role</Modal.Header>
        <Modal.Content>
          {(deleteRoleFetching || roleUsersFetching) && <StyledLoadingTransition />}
          {deleteRoleError && <ErrorMessage title="Unable to delete role" error={deleteRoleError} />}
          {roleUsersError && <ErrorMessage title="Unable to get assigned users" error={roleUsersError} />}
          {canDisplayMessage && this.renderWarning(role, roleUsers)}
        </Modal.Content>
        <Modal.Actions>
          <Button disabled={deleteRoleFetching || roleUsersFetching} onClick={onDeleteModalClose}>
            Cancel
          </Button>
          <Button
            disabled={deleteRoleFetching || roleUsersFetching}
            type="submit"
            onClick={this.onDeleteConfirmed}
            negative={true}
          >
            Delete
          </Button>
        </Modal.Actions>
      </Modal>
    )
  }
}

const mapStateToProps = (state: ApplicationState) => ({
  deleteRoleFetching: state.get('roleManagement').get('deleteRoleFetching'),
  deleteRoleError: state.get('roleManagement').get('deleteRoleError'),
  roleUsers: state.get('roleManagement').get('roleUsers'),
  roleUsersFetching: state.get('roleManagement').get('roleUsersFetching'),
  roleUsersError: state.get('roleManagement').get('roleUsersError')
})

const mapDispatchToProps = { deleteRole, getRoleUsers }

export default connect(mapStateToProps, mapDispatchToProps)(DeleteRoleModal)
