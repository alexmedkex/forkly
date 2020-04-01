import { shallow } from 'enzyme'
import { Header, Button } from 'semantic-ui-react'
import * as React from 'react'

import { StyledMenuItem, ErrorReport } from './ErrorReport'
import { User } from '../../../store/common/types'

const props = {
  lastRequests: [],
  profile: {} as User,
  lastError: null,
  isAuthorized: () => true
}

describe('ErrorReport', () => {
  it('renders header', () => {
    const component = shallow(<ErrorReport {...props} />)
    expect(component.find(Header).length).toEqual(1)
  })

  it('should call window.open', () => {
    window.open = jest.fn()
    const component = shallow(<ErrorReport {...props} />)
    const onClick = component.find(Button).props().onClick

    onClick(null, null)

    expect(window.open).toHaveBeenCalled()
  })

  it('should call window.location.reload', () => {
    window.location.reload = jest.fn()
    const component = shallow(<ErrorReport {...props} />)
    const onClick = component.find(StyledMenuItem).props().onClick

    onClick(null, null)

    expect(window.location.reload).toHaveBeenCalled()
  })
})
