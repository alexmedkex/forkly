import { mount, shallow } from 'enzyme'
import * as React from 'react'
import { Set, Map } from 'immutable'

import UsersTab, { FormikUsers } from './UsersTab'

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

const props: any = {
  isAuthorized: jest.fn(() => true),
  form: {
    values: {
      users: {
        userById: Map({
          u1: {
            id: 'u1',
            username: 'user-1',
            firstName: 'Zied'
          },
          u2: {
            id: 'u2',
            username: 'user-2',
            firstName: 'Mark'
          }
        }),
        all: Set(['u1', 'u2']),
        currentlyAssigned: Set(['u1']),
        toBeAssigned: Set(),
        toBeUnassigned: Set()
      }
    },
    setFieldValue: jest.fn(() => true)
  }
}

describe('UsersTab', () => {
  it('renders Field component', () => {
    const component = shallow(<UsersTab />)
    expect(component.props()).toMatchObject({
      component: expect.any(Function),
      name: 'users'
    })
  })
})

describe('FormikUsers', () => {
  describe('elements', () => {
    it('should renders user #2 in the list of available users', () => {
      const component = shallow(<FormikUsers {...props} />)
      expect(component.find('#users-available').find('li').length).toEqual(1)
    })
    it('should renders user #1 in the list of assigned users', () => {
      const component = shallow(<FormikUsers {...props} />)
      expect(component.find('#users-assigned').find('li').length).toEqual(1)
    })
    it('should disables Assign button if user is unauthorized', () => {
      const newProps = { ...props, isAuthorized: jest.fn(() => false) }
      const component = shallow(<FormikUsers {...newProps} />)
      expect(component.find('#assign-button').prop('disabled')).toEqual(true)
    })
    it('should filter users by existing name', async () => {
      const component = mount(<FormikUsers {...props} />)
      const instance: FormikUsers = component.instance() as FormikUsers
      instance.filterAvailableUsers({ target: { value: 'zi' } })
      await sleep(1)
      instance.filterAssignedUsers({ target: { value: 'zi' } })
      await sleep(1)
      component.update()
      expect(component.find('li').length).toEqual(1)
    })
    it('should filter users by non existing name', async () => {
      const component = mount(<FormikUsers {...props} />)
      const instance: FormikUsers = component.instance() as FormikUsers
      instance.filterAssignedUsers({ target: { value: 'zu' } })
      await sleep(1)
      instance.filterAvailableUsers({ target: { value: 'zu' } })
      await sleep(1)
      component.update()
      expect(component.find('li').length).toEqual(0)
    })
  })
  describe('click handlers', () => {
    it('should call click handler onAssignedSelectedChanged', () => {
      const component = mount(<FormikUsers {...props} />)
      const handelEditSearchSpy = jest.spyOn(component.instance() as FormikUsers, 'onAssignedSelectedChanged')

      const item = component.find('#users-assigned').find('li')
      expect(item.length).toBe(1)
      item.simulate('click')
      expect(handelEditSearchSpy).toHaveBeenCalled()
      expect(component.state().assignedSelected.length).toEqual(1)
      item.simulate('click')
      expect(component.state().assignedSelected.length).toEqual(0)
    })
    it('should call click handler onAvailableSelectedChanged', () => {
      const component = mount(<FormikUsers {...props} />)
      const handelEditSearchSpy = jest.spyOn(component.instance() as FormikUsers, 'onAvailableSelectedChanged')

      const item = component.find('#users-available').find('li')
      expect(item.length).toBe(1)
      item.simulate('click')
      expect(handelEditSearchSpy).toHaveBeenCalled()
      expect(component.state().availableSelected.length).toEqual(1)
      item.simulate('click')
      expect(component.state().availableSelected.length).toEqual(0)
    })
    it('should call click handler moveToAssigned', () => {
      const component = mount(<FormikUsers {...props} />)
      const instance: FormikUsers = component.instance() as FormikUsers
      instance.moveToAssigned = jest.fn()
      component.instance().forceUpdate()
      component.update()
      const item = component.find('button#assign-button')
      component.instance().forceUpdate()
      component.update()
      item.simulate('click')
      expect(instance.moveToAssigned).toHaveBeenCalled()
    })
    it('should call click handler moveToUnassigned', () => {
      const component = mount(<FormikUsers {...props} />)
      const instance: FormikUsers = component.instance() as FormikUsers
      instance.moveToUnassigned = jest.fn()
      instance.forceUpdate()
      component.update()
      const item = component.find('button#unassign-button')
      item.simulate('click')
      expect(instance.moveToUnassigned).toHaveBeenCalled()
    })
    it('should renders empty object', () => {
      const props2 = { ...props, form: { values: { users: { all: Set() } } } }
      const component = shallow(<FormikUsers {...props2} />)
      expect(component.length).toEqual(1)
    })
  })
})
