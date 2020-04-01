import { shallow } from 'enzyme'
import * as React from 'react'

import { Loader } from 'semantic-ui-react'

import { ErrorMessage } from '../../../components'
import { TaskStatus } from '../../tasks/store/types'
import { TaskView } from './TaskView'
import KycReviewDocumentsTask from './KycReviewDocumentsTask'

const task: any = {
  task: {
    _id: 'id',
    summary: 'summary',
    taskType: 'KYC.ReviewDocuments',
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

const defaultProps: any = {
  getTask: jest.fn(),
  task,
  taskFetching: false,
  taskError: null,
  match: {
    params: {
      id: 'task-id'
    }
  }
}

describe('TaskView', () => {
  it('should render KycReviewDocumentsTask component', () => {
    const component = shallow(<TaskView {...defaultProps} />)
    expect(component.find(KycReviewDocumentsTask)).toBeTruthy()
  })

  it('should render Loader when task is loading', () => {
    const newProps = { ...defaultProps, taskFetching: true }
    const component = shallow(<TaskView {...newProps} />)
    expect(component.find(Loader)).toBeTruthy()
  })

  it('should render error when task could not be fetched', () => {
    const newProps = { ...defaultProps, taskError: 'task error' }
    const component = shallow(<TaskView {...newProps} />)
    expect(component.find(ErrorMessage)).toBeTruthy()
  })

  it('should render error when task type is unknown', () => {
    const props = {
      ...defaultProps,
      task: {
        ...defaultProps.task,
        task: {
          ...defaultProps.task.task,
          taskType: 'XYZ'
        }
      }
    }
    const component = shallow(<TaskView {...props} />)
    const tree = component.find(ErrorMessage).html()
    expect(tree).toContain('Error')
    expect(tree).toContain('Unknown task type &quot;XYZ&quot;')
  })

  it('should render error when no handler', () => {
    const newProps = { ...defaultProps, taskError: 'task error' }
    const component: any = shallow(<TaskView {...newProps} />)
    component.instance().renderTaskWorkflow({ task: { taskType: '' } })
  })
})
