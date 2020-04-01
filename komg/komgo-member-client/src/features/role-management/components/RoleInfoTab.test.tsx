import { shallow } from 'enzyme'
import * as React from 'react'

import { RoleInfoTab } from './RoleInfoTab'

const props: any = {
  isAuthorized: jest.fn(() => true),
  isModification: true
}

describe('RoleInfoTab', () => {
  it('renders role name input', () => {
    const component = shallow(<RoleInfoTab {...props} />)
    expect(component.find('[component="input"]').props()).toMatchObject({
      disabled: true,
      component: 'input',
      name: 'label',
      id: 'role-label',
      placeholder: 'Role name'
    })
  })

  it('renders role description input', () => {
    const component = shallow(<RoleInfoTab {...props} />)
    expect(component.find('[component="textarea"]').props()).toMatchObject({
      component: 'textarea',
      name: 'description',
      id: 'role-description',
      placeholder: 'Description'
    })
  })
})
