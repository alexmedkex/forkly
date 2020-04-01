import { shallow } from 'enzyme'
import * as React from 'react'

import { NotificationView, NotificationViewProps } from './NotificationView'

let defaultProps: NotificationViewProps

describe('NotificationItem', () => {
  beforeEach(() => {
    defaultProps = {
      isFetching: false,
      errors: [],
      location: {
        state: undefined,
        hash: '',
        key: 'key',
        pathname: 'pathanem/key',
        search: ''
      },
      getNotification: jest.fn(),
      notification: undefined,
      history: undefined,
      match: {
        params: {
          id: 'test-id'
        },
        isExact: true,
        path: 'path',
        url: 'url'
      },
      staticContext: undefined
    }
  })

  it('should find LoadingTransition and not find ErrorMessage if isFetching is equal to true', () => {
    const wrapper = shallow(<NotificationView {...defaultProps} isFetching={true} />)

    const loadingTransition = wrapper.find('LoadingTransition')
    const errorMessage = wrapper.find('ErrorMessage')

    expect(errorMessage.length).toBe(0)
    expect(loadingTransition.length).toBe(1)
  })

  it('should find ErrorMessage and not LoadingTransition', () => {
    const wrapper = shallow(
      <NotificationView {...defaultProps} errors={[{ message: 'Test', errorCode: '400', origin: '', requestId: '' }]} />
    )

    const errorMessage = wrapper.find('ErrorMessage')
    const loadingTransition = wrapper.find('LoadingTransition')

    expect(errorMessage.length).toBe(1)
    expect(loadingTransition.length).toBe(0)
  })
})
