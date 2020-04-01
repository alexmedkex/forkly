import { shallow } from 'enzyme'
import * as React from 'react'

import { Route } from '../../store/common/types'

import { NavigationMenu } from './NavigationMenu'
import { Map, List } from 'immutable'

jest.mock('../../utils/user-storage', () => ({
  getRealmNameFromJWT: () => 'realmName'
}))

describe('NavigationMenu Component', () => {
  let defaultProps: any

  beforeEach(() => {
    defaultProps = {
      sidebarExtended: false,
      numberOfUnreadNotifications: 0,
      location: {
        pathname: '/tasks'
      },
      user: {
        id: '',
        username: 'User 1',
        firstName: 'First name',
        lastName: 'Last name',
        email: 'email@test.com',
        createdAt: 123,
        company: 'company'
      },
      isAuthorized: jest.fn(),
      isLicenseEnabled: jest.fn(() => true),
      setSidebar: jest.fn(),
      members: Map({
        byStaticId: List([])
      })
    }
  })

  it('should render NavigationMenu component', () => {
    const wrapper = shallow(<NavigationMenu {...defaultProps} />)

    const result = wrapper.exists()

    expect(result).toBe(true)
  })

  it('should render NavigationMenu component', () => {
    const wrapper = shallow(<NavigationMenu {...defaultProps} />)

    const result = wrapper.exists()

    expect(result).toBe(true)
  })

  it('should set active route', () => {
    const wrapper = shallow(<NavigationMenu {...defaultProps} />)

    expect(wrapper.state('active')).toBe('Tasks dashboard')
  })

  it('change active route after locations is changed', () => {
    const wrapper = shallow(<NavigationMenu {...defaultProps} />)

    wrapper.setProps({ ...defaultProps, location: { pathname: '/counterparties' } })

    expect(wrapper.state('active')).toBe('komgo network')
  })

  it('should render correct link for User Management', () => {
    const wrapper = shallow(<NavigationMenu {...defaultProps} />)

    const routes: Route[] = wrapper
      .find('NavMenu')
      .at(0)
      .prop('routes')

    const adminRoute = findRouteByName(routes, 'Administration')
    const userManagementRoute = findRouteByName(adminRoute.children, 'User Management')
    expect(userManagementRoute).toHaveProperty(
      'to',
      `${process.env.REACT_APP_KEYCLOAK_AUTH_URL}/admin/realmName/console/#/realms/realmName/users/`
    )
  })
  it('should render correct link for templates', () => {
    const wrapper = shallow(<NavigationMenu {...defaultProps} />)

    const routes: Route[] = wrapper
      .find('NavMenu')
      .at(0)
      .prop('routes')

    const instrumentsRoute = findRouteByName(routes, 'Financial instruments')
    const templatesRoute = findRouteByName(instrumentsRoute.children, 'Templates')
    expect(templatesRoute).toHaveProperty('to', '/templates')
  })
})

const findRouteByName = (routes: Route[], name): Route => {
  for (const route of routes) {
    if (route.name === name) {
      return route
    }
  }
  throw new Error(`Cannot find route ${name}`)
}
