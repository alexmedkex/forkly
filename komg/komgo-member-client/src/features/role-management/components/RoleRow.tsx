import * as React from 'react'
import { Table, Dropdown } from 'semantic-ui-react'
import styled from 'styled-components'
import { compose } from 'redux'
import { withRouter, RouteComponentProps } from 'react-router-dom'

import { administration } from '@komgo/permissions'
import { withPermissions, WithPermissionsProps } from '../../../components'
import { Role } from '../store/types'
import DeleteRoleModal from './DeleteRoleModal'

interface RoleRowProps extends RouteComponentProps<{}>, WithPermissionsProps {
  role: Role
}

interface RoleRowState {
  roleToDelete?: Role
}

const StyledCell = styled(Table.Cell)`
  &&& {
    max-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`

export class RoleRow extends React.Component<RoleRowProps, RoleRowState> {
  constructor(props: RoleRowProps) {
    super(props)
    this.state = {
      roleToDelete: undefined
    }
  }

  onDelete = (role: Role) => {
    this.setState({ roleToDelete: role })
  }

  onDeleteModalClose = () => {
    this.setState({ roleToDelete: undefined })
  }

  render() {
    const { role, history, isAuthorized } = this.props
    const { roleToDelete } = this.state
    const readOnly = !isAuthorized(administration.canCrudRoles)

    return (
      <>
        <Table.Row>
          <StyledCell width={6}>
            <b>{role.label}</b>
          </StyledCell>
          <Table.Cell>{role.isSystemRole ? 'System' : 'Custom'}</Table.Cell>
          <StyledCell title={role.description}>{role.description}</StyledCell>
          <Table.Cell width={2}>
            <StyledDropdown icon="ellipsis horizontal">
              <Dropdown.Menu direction="left">
                <Dropdown.Item id="edit-button" onClick={() => history.push(`/roles/${role.id}`)}>
                  {readOnly ? 'View' : 'Edit'}
                </Dropdown.Item>
                {!role.isSystemRole &&
                  !readOnly && (
                    <Dropdown.Item id="delete-button" onClick={() => this.onDelete(role)}>
                      Delete
                    </Dropdown.Item>
                  )}
              </Dropdown.Menu>
            </StyledDropdown>
          </Table.Cell>
        </Table.Row>
        {roleToDelete !== undefined && (
          <DeleteRoleModal role={roleToDelete} onDeleteModalClose={this.onDeleteModalClose} />
        )}
      </>
    )
  }
}

const StyledDropdown = styled(Dropdown)`
  float: right;
`

export default compose<any>(withPermissions, withRouter)(RoleRow)
