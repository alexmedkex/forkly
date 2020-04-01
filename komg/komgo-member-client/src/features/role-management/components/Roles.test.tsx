import { shallow } from 'enzyme'
import * as React from 'react'

import { Roles } from './Roles'
import { Unauthorized } from '../../../components'
import { Role } from '../store/types'

const props: any = {
  isAuthorized: () => false,
  getRolesError: null,
  rolesFetching: false,
  getRoles: jest.fn(),
  history: {
    push: jest.fn()
  },
  roles: [
    {
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
    }
  ]
}

describe('Roles', () => {
  it('renders <Route /> with EditRolePage as component to render', () => {
    const component = shallow(<Roles {...props} />)
    expect(
      component
        .find('Route')
        .at(0)
        .props()
    ).toMatchObject({
      exact: true,
      path: '/roles/'
    })
    expect(
      component
        .find('Route')
        .at(1)
        .props()
    ).toMatchObject({
      exact: true,
      path: '/roles/:id'
    })
  })

  it('calls searchRole', () => {
    const component = shallow(<Roles {...props} />)

    const instance = component.instance() as Roles
    instance.handleSearch(null, { value: 'test' })
    expect(component.state().searchRole).toEqual('test')
  })

  it("doesn't render Unauthorized if user is authorized", () => {
    props.isAuthorized = () => true
    const component = shallow(<Roles {...props} />)

    const res = component
      .find('Route')
      .findWhere(x => x.props().path === '/roles/')
      .props()
      .render()

    expect(res.type).not.toBe(Unauthorized)
  })

  it('renders Unauthorized component', () => {
    props.isAuthorized = () => false
    const component = shallow(<Roles {...props} />)

    const res = component
      .find('Route')
      .findWhere(x => x.props().path === '/roles/')
      .props()
      .render()

    expect(res.type).toBe(Unauthorized)
  })

  it('routes to /roles/new on Add New click', () => {
    const component = shallow(<Roles {...props} />)

    const instance = component.instance() as Roles
    instance.onAddNewClick({ preventDefault: () => null } as any)
    expect(props.history.push).toHaveBeenCalledWith('/roles/new')
  })
})
