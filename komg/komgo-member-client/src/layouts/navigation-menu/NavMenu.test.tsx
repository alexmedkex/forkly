import * as React from 'react'
import { shallow } from 'enzyme'
import * as renderer from 'react-test-renderer'
import { MemoryRouter as Router } from 'react-router'

import NavMenu from './NavMenu'

describe('NavMenu component', () => {
  const defaultProps = {
    active: 'Test',
    routes: [
      {
        to: '/tasks',
        exact: false,
        name: 'Tasks dashboard',
        canView: true,
        children: [],
        as: 'NavLink'
      }
    ],
    user: {
      id: '1',
      username: 'Username',
      firstName: 'First name',
      lastName: 'Last name',
      email: 'email',
      createdAt: 1,
      company: 'Company'
    },
    showReportIssue: false,
    numberOfUnreadNotifications: 0,
    lastRequests: [],
    lastError: null
  }

  it('should match snapshot', () => {
    expect(
      renderer
        .create(
          <Router>
            <NavMenu {...defaultProps} />
          </Router>
        )
        .toJSON()
    ).toMatchSnapshot()
  })

  it('should match snapshot when menu has sub-menus', () => {
    const routes = [
      ...defaultProps.routes,
      {
        to: '',
        exact: false,
        name: 'Liquidity',
        canView: true,
        as: 'NavLink',
        children: [
          {
            to: '/deposits',
            exact: false,
            name: 'Deposits',
            children: [],
            canView: true,
            as: 'NavLink'
          },
          {
            to: '/loans',
            exact: false,
            name: 'Loans',
            children: [],
            canView: true,
            as: 'NavLink'
          }
        ]
      }
    ]
    expect(
      renderer
        .create(
          <Router>
            <NavMenu {...defaultProps} routes={routes} />
          </Router>
        )
        .toJSON()
    ).toMatchSnapshot()
  })

  it('should find one NavLink component with href for task', () => {
    const wrapper = shallow(<NavMenu {...defaultProps} />)

    const navLinks = wrapper.find('NavLink')

    expect(navLinks.length).toBe(1)
    expect(navLinks.first().props().to).toEqual('/tasks')
  })
})
