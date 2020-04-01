import { shallow } from 'enzyme'
import * as React from 'react'

import TaskRow from './TaskRow'
import { TaskWithUser, TaskStatus, Task } from '../store/types'
import { Menu, Dropdown } from 'semantic-ui-react'

const tasks: any = [
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
    user: { username: 'jbourne', firstName: 'Jason', lastName: 'Bourne', email: 'jbourne@corp.com' }
  }
]

const defaultProps = {
  tasks,
  onViewDetailsClick: (task: TaskWithUser) => null,
  onAssigneeToMe: (task: Task) => null,
  onOpenTaskClick: (task: TaskWithUser) => null,
  onAssigneeTo: (task: Task) => null
}

describe('TaskRow', () => {
  it('renders assignee name', () => {
    const component = shallow(<TaskRow {...defaultProps} />)
    expect(component.find({ className: 'userName' }).text()).toEqual('Jason Bourne')
  })

  it('renders menu with "Go to" and "Assign to..." options', () => {
    const component = shallow(<TaskRow {...defaultProps} />)
    expect(component.find(Dropdown.Item).length).toEqual(2)
  })

  it('renders menu with "View Task" option', () => {
    defaultProps.tasks[0].task.status = TaskStatus.Done
    const component = shallow(<TaskRow {...defaultProps} />)
    expect(component.find(Dropdown.Item).length).toEqual(1)
  })
})
