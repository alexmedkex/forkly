import { shallow } from 'enzyme'
import { Grid } from 'semantic-ui-react'
import * as React from 'react'

import { TaskStatus } from '../store/types'
import TaskDetails from './TaskDetails'
import { renderDateColumn, Done } from './TaskDetails'

const task: any = {
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
}

describe('TaskDetails', () => {
  it('renders Grid component', () => {
    const component = shallow(<TaskDetails task={task} />)
    expect(component.find(Grid)).toBeTruthy()
  })

  it('render Done column', () => {
    const comp = shallow(renderDateColumn('2018-10-08T04:35:11.048Z', TaskStatus.Done) as JSX.Element)
    expect(comp.find(Done).exists).toBeTruthy()
  })
})
