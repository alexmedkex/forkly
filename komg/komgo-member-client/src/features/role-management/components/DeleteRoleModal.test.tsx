import { mount, shallow } from 'enzyme'
import { List } from 'immutable'
import { Modal } from 'semantic-ui-react'
import * as React from 'react'

import { ErrorMessage } from '../../../components'
import { DeleteRoleModal } from './DeleteRoleModal'

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
      }
    ]
  },
  deleteRoleFetching: false,
  deleteRoleError: null,
  roleUsers: List([{}, {}, {}]),
  roleUsersFetching: false,
  roleUsersError: null,
  deleteRole: jest.fn(),
  getRoleUsers: jest.fn(),
  onDeleteModalClose: jest.fn()
}

describe('DeleteRoleModal', () => {
  it('renders role name in a message', () => {
    const component = shallow(<DeleteRoleModal {...props} />)
    expect(
      component.find(Modal.Content).containsMatchingElement(
        <p>
          You are about to delete the user role <b>KYC Admin</b>
        </p>
      )
    ).toBeTruthy()
  })
  it('renders roleUsersError', () => {
    const newProps = {
      ...props,
      roleUsersError: '404 Not Found'
    }
    const component = shallow(<DeleteRoleModal {...newProps} />)
    const tree = component.find(ErrorMessage).html()
    expect(tree).toContain('Unable to get assigned users')
    expect(tree).toContain(newProps.roleUsersError)
  })
  it('should call click handler submit', () => {
    const component: any = mount(<DeleteRoleModal {...props} />)
    component.instance().onDeleteConfirmed = jest.fn()
    component.instance().forceUpdate()
    component.update()
    const item = component.find("button[type='submit']")
    item.simulate('click')
    expect(component.instance().onDeleteConfirmed).toHaveBeenCalled()
  })
})
