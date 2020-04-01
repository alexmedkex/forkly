import * as React from 'react'
import { shallow } from 'enzyme'
import * as renderer from 'react-test-renderer'
import { MemoryRouter as Router } from 'react-router'
import { Dropdown, Menu } from 'semantic-ui-react'
import BottomMenu, { ITopFixedMenuProps } from './TopFixedMenu'

describe('BottomMenu component', () => {
  const defaultProps: ITopFixedMenuProps = {
    user: {
      id: '1',
      username: 'Username',
      firstName: 'First name',
      lastName: 'Last name',
      email: 'email',
      createdAt: 1,
      company: 'Company'
    },
    sidebarExtended: false,
    numberOfUnreadNotifications: 0,
    setSidebar: jest.fn(),
    logout: jest.fn()
  }

  it('should match default snapshot', () => {
    expect(
      renderer
        .create(
          <Router>
            <BottomMenu {...defaultProps} />
          </Router>
        )
        .toJSON()
    ).toMatchSnapshot()
  })

  it('Should call logout', () => {
    const wrapper = shallow(<BottomMenu {...defaultProps} />)

    const logoutItem = wrapper.find('[data-test-id="logout-button"]')

    logoutItem.simulate('click')

    expect(defaultProps.logout).toHaveBeenCalled()
  })

  it('should find label item when there are unread notification', () => {
    const wrapper = shallow(<BottomMenu {...defaultProps} numberOfUnreadNotifications={1} />)

    const labelItems = wrapper.find('Label')

    expect(labelItems.exists()).toBe(true)
  })

  it('should not find label item when there are not unread notification', () => {
    const wrapper = shallow(<BottomMenu {...defaultProps} />)

    const labelItems = wrapper.find('Label')

    expect(labelItems.exists()).toBe(false)
  })

  it('should call setSidebar when notification text is clicked', () => {
    const wrapper = shallow(<BottomMenu {...defaultProps} />)

    const notification = wrapper.find('[data-test-id="notification-button"]')

    notification.simulate('click')

    expect(defaultProps.setSidebar).toHaveBeenCalled()
  })
})
