import * as React from 'react'
import { mount } from 'enzyme'
import * as renderer from 'react-test-renderer'
import { MemoryRouter as Router } from 'react-router-dom'
import NotificationsForm, { IProps } from './NotificationsForm'

const defaultProps: IProps = {
  settings: {
    userId: 'userId',
    sendInformationNotificationsByEmail: true,
    sendTaskNotificationsByEmail: true
  },
  updateUserSettings: jest.fn()
}

describe('NotificationsForm', () => {
  beforeEach(() => {
    process.env.REACT_APP_METRICS_AND_EMAIL_NOTIFICATIONS = 'true'
  })

  it('should match snapshot', () => {
    const tree = renderer
      .create(
        <Router>
          <NotificationsForm {...defaultProps} />
        </Router>
      )
      .toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('should call updateUserSettings onSubmit', done => {
    const wrapper = mount(
      <Router>
        <NotificationsForm {...defaultProps} />
      </Router>
    )
    const values = { sendInformationNotificationsByEmail: true, sendTaskNotificationsByEmail: true }

    wrapper.find('form').simulate('submit')

    setTimeout(() => {
      expect(defaultProps.updateUserSettings).toHaveBeenCalledWith('userId', values)
      done()
    })
  })

  it('should disable sendTaskNotificationsByEmail checkbox if REACT_APP_METRICS_AND_EMAIL_NOTIFICATIONS is false', async () => {
    jest.resetModules()
    process.env.REACT_APP_METRICS_AND_EMAIL_NOTIFICATIONS = 'false'
    const NotificationsFormUpdated = (await require('./NotificationsForm')).default
    const component = mount(
      <Router>
        <NotificationsFormUpdated {...defaultProps} />
      </Router>
    )
    expect(
      component
        .find('#sendTaskNotificationsByEmail')
        .at(0)
        .prop('title')
    ).toEqual('Your administrator has disabled email notifications')
  })
})
