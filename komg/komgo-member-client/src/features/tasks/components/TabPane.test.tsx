import { shallow } from 'enzyme'
import { Table } from 'semantic-ui-react'
import * as React from 'react'

import { TaskStatus } from '../../tasks/store/types'
import TabPane from './TabPane'

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
    user: { id: 'user-id', username: 'jbourne', firstName: 'Jason', lastName: 'Bourne', email: 'jbourne@corp.com' }
  }
]

describe('TabPane', () => {
  it('renders Table component', () => {
    const component = shallow(
      <TabPane
        tasks={tasks}
        onViewDetailsClick={() => null}
        onAssigneeToMe={() => null}
        onAssigneeTo={() => null}
        onOpenTaskClick={() => null}
      />
    )
    expect(component.find(Table)).toBeTruthy()
  })
})
