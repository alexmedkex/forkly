import { mount, shallow } from 'enzyme'
import * as React from 'react'

jest.mock('./RoleInfoTab', () => () => null)
jest.mock('./UsersTab', () => () => null)
jest.mock('./PermissionsTab', () => () => null)
import { EditRolePage } from './EditRolePage'

const props: any = {
  role: {
    id: 'kycAdmin',
    label: 'KYC Admin',
    description: 'KYC Admin Role Description',
    permittedActions: [
      {
        product: {
          id: 'kyc',
          label: 'KYC'
        },
        action: {
          id: 'manageKyc',
          label: 'Manage KYC'
        },
        permission: { id: 'createAndShare', label: 'Create And Share' }
      },
      {
        product: {
          id: 'kyc1',
          label: 'KYC'
        },
        action: {
          id: 'manageKyc',
          label: 'Manage KYC'
        }
      }
    ]
  },
  match: {
    params: {
      id: 'kycAdmin'
    }
  },
  roleFetching: false,
  roleError: null,
  products: [],
  productsFetching: false,
  productsError: null,
  postRoleFetching: false,
  postRoleError: null,
  putRoleFetching: false,
  putRoleError: null,
  roleUsers: [{ id: 'user-1' }, { id: 'user-2' }],
  roleUsersFetching: false,
  roleUsersError: null,
  allUsers: [{ id: 'user-1' }, { id: 'user-2' }, { id: 'user-3' }],
  allUsersFetching: false,
  allUsersError: null,
  isAuthorized: jest.fn(() => true),
  getRole: jest.fn(),
  createRole: jest.fn(),
  updateRole: jest.fn(),
  updateAssignedUsers: jest.fn(),
  getRoleUsers: jest.fn(),
  getAllUsers: jest.fn(),
  getProducts: jest.fn(),
  history: { push: jest.fn() }
}

describe('EditRolePage', () => {
  it('renders Formik', () => {
    const component = shallow(<EditRolePage {...props} />)
    const instance: any = component.instance()
    expect(component.find('Formik').props()).toMatchObject({
      initialValues: {
        description: 'KYC Admin Role Description',
        label: 'KYC Admin',
        permissions: {
          'kyc:manageKyc': 'createAndShare'
        }
      },
      validate: instance.validate,
      validateOnBlur: false,
      validateOnChange: false,
      enableReinitialize: true,
      onSubmit: instance.onSubmit,
      render: instance.formikRender
    })
  })

  it('renders "Edit role" title', () => {
    const component = shallow(<EditRolePage {...props} />)
    const renderProps = { handleSubmit: jest.fn(), errors: {}, error: null, values: {} }
    const modalInstance: any = component.instance()

    const formikContent = shallow(React.createElement(() => modalInstance.formikRender(renderProps)))

    expect(
      formikContent
        .find({ id: 'page-header' })
        .first()
        .prop('children')
    ).toEqual('Edit Role')
  })

  it('renders "Create role" title', () => {
    const newProps = {
      ...props,
      match: {
        params: {
          id: 'new'
        }
      }
    }
    const component = shallow(<EditRolePage {...newProps} />)
    const renderProps = { handleSubmit: jest.fn(), errors: {}, error: null, values: {} }
    const modalInstance: any = component.instance()

    const formikContent = shallow(React.createElement(() => modalInstance.formikRender(renderProps)))

    expect(
      formikContent
        .find({ id: 'page-header' })
        .first()
        .prop('children')
    ).toEqual('Create Role')
  })

  it('disables Update Role button if there are no changes', () => {
    const component = shallow(<EditRolePage {...props} />)
    const renderProps = {
      handleSubmit: jest.fn(),
      errors: {},
      error: null,
      values: {},
      dirty: false
    }
    const modalInstance: any = component.instance()

    const formikContent = shallow(React.createElement(() => modalInstance.formikRender(renderProps)))

    expect(formikContent.find('#submit-role-form').prop('disabled')).toEqual(true)
  })

  it('enables Update Role button if there are changes', () => {
    const component = shallow(<EditRolePage {...props} />)
    const renderProps = {
      handleSubmit: jest.fn(),
      errors: {},
      error: null,
      values: {},
      dirty: true
    }
    const modalInstance: any = component.instance()

    const formikContent = shallow(React.createElement(() => modalInstance.formikRender(renderProps)))

    expect(formikContent.find('#submit-role-form').prop('disabled')).toEqual(false)
  })

  describe('onSubmit', () => {
    const actions = { setSubmitting: jest.fn() }

    beforeEach(() => {
      jest.clearAllMocks()
    })

    it('should call updateRole', () => {
      const component = shallow(<EditRolePage {...props} />)
      const instance: EditRolePage = component.instance() as EditRolePage
      instance.onSubmit(undefined, actions as any)
      expect(props.updateRole).toHaveBeenCalledTimes(1)
    })

    it('should call createRole when role is new', () => {
      const props2 = { ...props, match: { params: { id: 'new' } } }
      const component = shallow(<EditRolePage {...props2} />)
      const instance: EditRolePage = component.instance() as EditRolePage
      instance.onSubmit(undefined, actions as any)
      expect(props.createRole).toHaveBeenCalledTimes(1)
    })

    it('should call updateAssignedUsers when role is a system role', () => {
      const props2 = { ...props, role: { ...props.role, isSystemRole: true } }
      const component = shallow(<EditRolePage {...props2} />)
      const instance: EditRolePage = component.instance() as EditRolePage
      instance.onSubmit(undefined, actions as any)
      expect(props.updateAssignedUsers).toHaveBeenCalledTimes(1)
    })
  })

  describe('validate', () => {
    it('should warn on empty label', () => {
      const component = shallow(<EditRolePage {...props} />)
      const instance: EditRolePage = component.instance() as EditRolePage
      const result = instance.validate({ label: '', description: '1' } as any)
      expect(result).toEqual({ label: 'Role name cannot be empty' })
    })
    it('should warn on "new" label', () => {
      const component = shallow(<EditRolePage {...props} />)
      const instance: EditRolePage = component.instance() as EditRolePage
      const result = instance.validate({ label: 'new', description: '1' } as any)
      expect(result).toEqual({ label: 'Role name cannot be "new". This is a reserved name' })
    })
    it('should warn on empty description', () => {
      const component = shallow(<EditRolePage {...props} />)
      const instance: EditRolePage = component.instance() as EditRolePage
      const result = instance.validate({ label: '1', description: '' } as any)
      expect(result).toEqual({ description: 'Description cannot be empty' })
    })
  })
  it('should render max length', () => {
    const props2 = { ...props, role: { ...props.role, description: Array(170).join('q') } }
    const component = mount(<EditRolePage {...props2} />)
    expect(component[Symbol.for('enzyme.__nodes__')][0].rendered.instance.initialValues.description.length).toEqual(160)
  })
  it('should redirect to the list page', () => {
    const component = mount(<EditRolePage {...props} />)
    const instance: EditRolePage = component.instance() as EditRolePage
    instance.onClose()
    expect(props.history.push).toHaveBeenCalled()
  })
  it('should redirect to the list page', () => {
    const component = mount(<EditRolePage {...props} />)
    component.instance().componentDidUpdate({ match: { params: { id: 'new' } } }, undefined)
    expect(props.getRole).toHaveBeenCalled()
  })
  it('should render with errors', () => {
    const props2 = { ...props, role: { ...props.role, description: '' } }
    const component = mount(<EditRolePage {...props2} />)
    const item = component.find('button#submit-role-form')
    expect(item.length).toBe(1)
    item.simulate('click')
    expect(props.getRole).toHaveBeenCalled()
  })
})
