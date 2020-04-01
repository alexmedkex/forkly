import { shallow } from 'enzyme'
import * as React from 'react'
import { Tasks } from './Tasks'
import { TaskStatus } from '../store/types'

const tasks = [
  {
    task: {
      _id: 'id',
      summary: 'summary',
      taskType: 'type1',
      status: TaskStatus.ToDo,
      counterpartyName: 'counterpartyName',
      requiredPermission: {
        productId: 'productId',
        actionId: 'actionId'
      },
      assignee: 'assignee',
      context: {},
      updatedAt: '2018-10-08T04:35:11.048Z',
      createdAt: '2018-10-08T04:35:11.048Z',
      dueAt: '2018-10-08T04:35:11.048Z'
    },
    user: { id: 'user-id', username: 'jbourne', firstName: 'Jason', lastName: 'Bourne', email: 'jbourne@corp.com' }
  },
  {
    task: {
      _id: 'id',
      summary: 'summary',
      taskType: 'type1',
      status: TaskStatus.Done,
      counterpartyName: 'counterpartyName',
      requiredPermission: {
        productId: 'productId',
        actionId: 'actionId'
      },
      assignee: 'assignee',
      context: {},
      updatedAt: '2018-10-08T04:35:11.048Z',
      createdAt: '2018-10-08T04:35:11.048Z',
      dueAt: '2018-10-08T04:35:11.048Z'
    },
    user: { id: 'user-id', username: 'jbourne', firstName: 'Jason', lastName: 'Bourne', email: 'jbourne@corp.com' }
  }
]

describe('Tasks', () => {
  let props: any
  beforeEach(() => {
    props = {
      tasks,
      getTasks: jest.fn()
    }
  })

  it('should render Modal components - details and task', () => {
    const component = shallow(<Tasks {...props} />)
    expect(component.find('Modal').length).toEqual(2)
  })
})
