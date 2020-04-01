import * as React from 'react'
import { connect } from 'react-redux'
import { compose } from 'redux'
import { Set, Map } from 'immutable'
import { RouteComponentProps } from 'react-router-dom'
import { Button, Tab, Form } from 'semantic-ui-react'
import { History } from 'history'
import styled from 'styled-components'
import { Formik, FormikBag, FormikProps, FormikErrors } from 'formik'

import { User } from '../../../store/common/types'
import { ErrorMessage, withPermissions, WithPermissionsProps } from '../../../components'
import { ApplicationState } from '../../../store/reducers'
import { administration } from '@komgo/permissions'

import RoleInfoTab from './RoleInfoTab'
import UsersTab from './UsersTab'
import PermissionsTab from './PermissionsTab'
import {
  getRole,
  getProducts,
  createRole,
  updateRole,
  getRoleUsers,
  getAllUsers,
  updateAssignedUsers
} from '../store/actions'
import {
  RoleState,
  ProductsState,
  PostRoleState,
  PutRoleState,
  Role,
  RoleForm,
  RoleUsersState,
  AllUsersState,
  UpdateAssignedUsersState
} from '../store/types'
import { newRoleRouteId } from '../constants'

interface MatchParams {
  id: string
}

interface EditRolePageProps
  extends RouteComponentProps<MatchParams>,
    WithPermissionsProps,
    RoleState,
    ProductsState,
    PostRoleState,
    PutRoleState,
    RoleUsersState,
    AllUsersState,
    UpdateAssignedUsersState {
  getRole: (id: string) => any
  createRole: (formValues: RoleForm, history: History) => any
  updateRole: (roleId: string, formValues: RoleForm, history: History) => any
  updateAssignedUsers: (roleId: string, formValues: RoleForm, history: History, successMessage: string) => any
  getRoleUsers: (roleId: string) => any
  getAllUsers: () => any
  getProducts: () => any
}

const StyledSpacer = styled.div`
  margin-bottom: 2.5em;
`

const StyledBigHeader = styled.h1`
  margin-bottom: 1.5em;
`

const StyledSmallHeader = styled.h4`
  background-color: #f2f5f8;
  margin-bottom: 1.5em;
  margin-top: 1.5em;
  padding: 0.5em;
`

const StyledFooter = styled.div`
  margin-top: 1.5em;
  text-align: right;
`

const MAX_DESRIPTION_LENGTH = 160

export class EditRolePage extends React.Component<EditRolePageProps> {
  componentDidMount() {
    this.props.getProducts()
    this.props.getAllUsers()
    const roleId = this.props.match.params.id
    if (roleId !== newRoleRouteId) {
      this.props.getRole(roleId)
      this.props.getRoleUsers(roleId)
    }
  }

  componentDidUpdate(prevProps: EditRolePageProps) {
    const roleId = this.props.match.params.id
    if (roleId !== prevProps.match.params.id && roleId !== newRoleRouteId) {
      this.props.getRole(roleId)
    }
  }

  getRoleForm = (role?: Role): RoleForm => {
    const { match, allUsers, roleUsers } = this.props
    const roleId = match.params.id
    const isModification = roleId !== newRoleRouteId
    const userById = {}
    allUsers.forEach((user: User) => {
      userById[user.id] = user
    })
    const users = {
      userById: Map<string, User>(userById),
      all: Set<string>(Object.keys(userById)),
      currentlyAssigned: isModification ? Set<string>(roleUsers.map((user: User) => user.id)) : Set<string>(),
      toBeAssigned: Set<string>(),
      toBeUnassigned: Set<string>()
    }

    if (!role || !isModification) {
      return {
        label: '',
        description: '',
        permissions: {},
        isSystemRole: false,
        users,
        rowCheckboxes: {}
      }
    }

    const permissions = {}
    const rowCheckboxes = {}
    role.permittedActions.forEach(item => {
      if (item.permission && item.permission.id) {
        permissions[`${item.product.id}:${item.action.id}`] = item.permission.id
      } else {
        permissions[`${item.product.id}:${item.action.id}`] = true
      }

      rowCheckboxes[`${item.product.id}:${item.action.id}`] = true
    })

    return {
      label: role.label,
      description: role.description,
      isSystemRole: role.isSystemRole || false,
      permissions,
      users,
      rowCheckboxes
    }
  }

  onClose = (): void => {
    this.props.history.push('/roles')
  }

  onSubmit = (formValues: RoleForm, actions: FormikBag<RoleForm, RoleForm>) => {
    const { match, role, history } = this.props
    const roleId = match.params.id
    const isModification = roleId !== newRoleRouteId
    if (isModification) {
      if (role && role.isSystemRole) {
        this.props.updateAssignedUsers(roleId, formValues, history, 'Role has been updated')
      } else {
        this.props.updateRole(roleId, formValues, history)
      }
    } else {
      this.props.createRole(formValues, history)
    }
    actions.setSubmitting(false)
  }

  validate = (formValues: RoleForm): FormikErrors<RoleForm> => {
    const errors: FormikErrors<RoleForm> = {}
    if (!formValues.label.trim()) {
      errors.label = 'Role name cannot be empty'
    } else if (formValues.label.toLowerCase() === newRoleRouteId) {
      errors.label = `Role name cannot be "${newRoleRouteId}". This is a reserved name`
    }
    if (!formValues.description || !formValues.description.trim()) {
      errors.description = 'Description cannot be empty'
    }

    return errors
  }

  formikRender = ({ handleSubmit, errors, error, values, dirty }: FormikProps<RoleForm>) => {
    const roleId = this.props.match.params.id
    const isModification = roleId !== newRoleRouteId
    const { roleFetching, productsFetching, roleUsersFetching, allUsersFetching } = this.props
    const canShowTheForm = this.canShowTheForm()
    const { products } = this.props
    const title = isModification ? 'Edit Role' : 'Create Role'

    let length = values.description ? values.description.length : 0
    if (values.description && length > MAX_DESRIPTION_LENGTH) {
      values.description = values.description.slice(0, MAX_DESRIPTION_LENGTH)
      length = MAX_DESRIPTION_LENGTH
    }

    return (
      <>
        <Form onSubmit={handleSubmit}>
          {canShowTheForm && (
            <>
              <StyledBigHeader id="page-header">{title}</StyledBigHeader>

              <StyledSmallHeader>Role Info</StyledSmallHeader>
              <RoleInfoTab
                maxLength={MAX_DESRIPTION_LENGTH}
                currentLength={length}
                isModification={isModification}
                isSystemRole={values.isSystemRole}
              />
              <StyledSpacer />

              <StyledSmallHeader>Permissions</StyledSmallHeader>
              <PermissionsTab formValues={values} products={products} isSystemRole={values.isSystemRole} />

              <StyledSmallHeader>Users</StyledSmallHeader>
              <UsersTab />

              {Object.entries(errors).map(([field, validationError]: [string, string], idx) => (
                <ErrorMessage key={idx} title="Please complete all required fields" error={validationError} />
              ))}
              {error && <ErrorMessage title="Form error" error={error} />}
            </>
          )}
          {this.renderErrors()}
        </Form>
        {canShowTheForm && this.renderModalActions(dirty, handleSubmit)}
      </>
    )
  }

  render() {
    const { role } = this.props

    return (
      <Formik
        initialValues={this.getRoleForm(role)}
        validate={this.validate}
        validateOnBlur={false}
        validateOnChange={false}
        enableReinitialize={true}
        onSubmit={this.onSubmit}
        render={this.formikRender}
      />
    )
  }

  private renderErrors(): JSX.Element {
    const {
      roleError,
      productsError,
      postRoleError,
      putRoleError,
      roleUsersError,
      updateAssignedUsersError
    } = this.props

    return (
      <>
        {roleError && <ErrorMessage title="Unable to load role" error={roleError} />}
        {productsError && <ErrorMessage title="Unable to load products" error={productsError} />}
        {postRoleError && <ErrorMessage title="Unable to create role" error={postRoleError} />}
        {putRoleError && <ErrorMessage title="Unable to update role" error={putRoleError} />}
        {roleUsersError && <ErrorMessage title="Unable to get role users" error={roleUsersError} />}
        {updateAssignedUsersError && (
          <ErrorMessage title="Unable to update assigned users" error={updateAssignedUsersError} />
        )}
      </>
    )
  }

  private renderModalActions(
    isDirty: boolean,
    handleSubmit: (e?: React.FormEvent<HTMLFormElement>) => void
  ): JSX.Element {
    const roleId = this.props.match.params.id
    const isModification = roleId !== newRoleRouteId
    const { postRoleFetching, putRoleFetching, updateAssignedUsersFetching, isAuthorized } = this.props
    return (
      <StyledFooter>
        <Button disabled={postRoleFetching || putRoleFetching || updateAssignedUsersFetching} onClick={this.onClose}>
          {(isAuthorized(administration.canCrudRoles) && 'Cancel') || 'Close'}
        </Button>
        {isAuthorized(administration.canCrudRoles) && (
          <Button
            disabled={postRoleFetching || putRoleFetching || updateAssignedUsersFetching || !isDirty}
            id="submit-role-form"
            type="submit"
            onClick={() => handleSubmit()}
            primary={true}
          >
            {isModification ? 'Update' : 'Create'} role
          </Button>
        )}
      </StyledFooter>
    )
  }

  private canShowTheForm(): boolean {
    const {
      roleFetching,
      roleError,
      productsFetching,
      productsError,
      roleUsersError,
      roleUsersFetching,
      allUsersError,
      allUsersFetching
    } = this.props
    return (
      !roleFetching &&
      !productsFetching &&
      !productsError &&
      !roleError &&
      !roleUsersError &&
      !roleUsersFetching &&
      !allUsersError &&
      !allUsersFetching
    )
  }
}

const mapStateToProps = (state: ApplicationState) => ({
  role: state.get('roleManagement').get('role'),
  roleFetching: state.get('roleManagement').get('roleFetching'),
  roleError: state.get('roleManagement').get('roleError'),
  products: state.get('roleManagement').get('products'),
  productsFetching: state.get('roleManagement').get('productsFetching'),
  productsError: state.get('roleManagement').get('productsError'),
  postRoleFetching: state.get('roleManagement').get('postRoleFetching'),
  postRoleError: state.get('roleManagement').get('postRoleError'),
  putRoleFetching: state.get('roleManagement').get('putRoleFetching'),
  putRoleError: state.get('roleManagement').get('putRoleError'),
  roleUsers: state.get('roleManagement').get('roleUsers'),
  roleUsersFetching: state.get('roleManagement').get('roleUsersFetching'),
  roleUsersError: state.get('roleManagement').get('roleUsersError'),
  allUsers: state.get('roleManagement').get('allUsers'),
  allUsersFetching: state.get('roleManagement').get('allUsersFetching'),
  allUsersError: state.get('roleManagement').get('allUsersError')
})

const mapDispatchToProps = {
  getRole,
  getProducts,
  createRole,
  updateRole,
  getRoleUsers,
  getAllUsers,
  updateAssignedUsers
}

export default compose<any>(withPermissions, connect(mapStateToProps, mapDispatchToProps))(EditRolePage)
