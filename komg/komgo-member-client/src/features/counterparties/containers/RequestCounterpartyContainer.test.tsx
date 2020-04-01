import * as React from 'react'
import { shallow, mount } from 'enzyme'
import { RequestCounterpartyContainer } from './RequestCounterpartyContainer'

describe('RequestCounterpartyContainer component', () => {
  let defaultProps: any
  beforeEach(() => {
    defaultProps = {
      isRequestModalOpen: false,
      getCounterpartyRequestAsync: jest.fn(),
      actionCallback: jest.fn(),
      isAuthorized: jest.fn(),
      task: {
        task: {
          context: {
            type: 'coverageRequest',
            id: 1
          }
        }
      }
    }
  })

  it('should render component successfully', () => {
    const wrapper = shallow(<RequestCounterpartyContainer {...defaultProps} />)

    expect(wrapper.exists()).toBe(true)
  })

  it('should call callback on request completed', () => {
    const wrapper = mount(<RequestCounterpartyContainer {...defaultProps} />)
    wrapper.setProps({ requestResponseActionStatus: true })

    expect(defaultProps.actionCallback).toHaveBeenCalledWith(true)
  })
})
