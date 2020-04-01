import * as React from 'react'
import { mount } from 'enzyme'
import * as renderer from 'react-test-renderer'
import { createMemoryHistory } from 'history'
import { MemoryRouter as Router } from 'react-router-dom'
import { Profile, IProps } from './Profile'

const defaultProps: IProps = {
  profile: {
    id: 'id',
    username: 'username',
    firstName: 'firstName',
    lastName: 'lastName',
    email: 'email@email.com',
    roles: [],
    createdAt: 123123123,
    company: 'company',
    settings: {
      userId: 'userId',
      sendInformationNotificationsByEmail: true,
      sendTaskNotificationsByEmail: true
    }
  },
  roles: [],
  isFetching: false,
  history: createMemoryHistory(),
  staticContext: undefined,
  location: {
    pathname: '',
    search: '',
    state: '',
    hash: ''
  },
  match: undefined,
  getRoles: jest.fn(),
  updateUserSettings: jest.fn(),
  resetPassword: jest.fn()
}

describe('Profile', () => {
  it('should match snapshot', () => {
    const tree = renderer
      .create(
        <Router>
          <Profile {...defaultProps} />
        </Router>
      )
      .toJSON()
    expect(tree).toMatchSnapshot()
  })

  describe('componentDidMount', () => {
    it('should fetches roles', () => {
      mount(
        <Router>
          <Profile {...defaultProps} />
        </Router>
      )

      expect(defaultProps.getRoles).toHaveBeenCalled()
    })
  })

  describe('componentDidUpdate', () => {
    it('should check activeIndex', () => {
      const component = mount(
        <Router>
          <Profile {...defaultProps} />
        </Router>
      )
      const instance = component.find(Profile).instance() as Profile
      const spy = jest.spyOn(instance, 'handleChange')

      instance.forceUpdate()
      expect(spy).toHaveBeenCalled()
    })
  })
})
