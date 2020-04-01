import { mount, shallow } from 'enzyme'
import * as React from 'react'

jest.mock('./DeleteRoleModal', () => () => null)

import { RoleRow } from './RoleRow'

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

const props: any = {
  history: {
    push: jest.fn()
  },
  isAuthorized: jest.fn(() => true),
  role: {
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
}

describe('RoleRow', () => {
  it('renders role name in a first column', () => {
    const component = shallow(<RoleRow {...props} />)
    expect(
      component
        .find('Styled(TableCell)')
        .at(0)
        .props()
    ).toMatchObject({
      children: <b>KYC Admin</b>
    })
  })
  it('renders role description in a third column', () => {
    const component = shallow(<RoleRow {...props} />)
    expect(
      component
        .find('Styled(TableCell)')
        .at(1)
        .props()
    ).toMatchObject({
      children: 'KYC Admin Role Description'
    })
  })
  it('should call click handler onDelete', async () => {
    expect.assertions(2)
    const component = mount(<RoleRow {...props} />)
    const onDeleteConfirmedSpy = jest.spyOn(component.instance() as RoleRow, 'onDelete')
    const item = component.find('div#delete-button')
    item.simulate('click')
    await sleep(1)
    expect(onDeleteConfirmedSpy).toHaveBeenCalled()
    expect(component.state().roleToDelete).toEqual(props.role)
  })
  it('should close the modal', async () => {
    const component = mount(<RoleRow {...props} />)
    component.setState({ roleToDelete: props.role })
    const instance: RoleRow = component.instance() as RoleRow
    instance.onDeleteModalClose()
    await sleep(1)
    expect(component.state().roleToDelete).toEqual(undefined)
  })
  it('should redirect to edit page', async () => {
    const component = mount(<RoleRow {...props} />)
    const item = component.find('div#edit-button')
    item.simulate('click')
    await sleep(1)
    expect(props.history.push).toHaveBeenCalled()
  })
})
